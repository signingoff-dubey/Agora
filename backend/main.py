from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import json
from typing import Dict, Any, List
from pydantic import BaseModel
import asyncio
import html
import re
import time
from collections import defaultdict

from ollama_manager import get_model_discovery, is_ollama_running, get_installed_models
from board import BoardEntry, SharedBoard, SessionManager

import sys
import os

# Set up logging to both console and file
log_formatter = logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# File handler
file_handler = logging.FileHandler("agora.log", mode="a")
file_handler.setFormatter(log_formatter)
logger.addHandler(file_handler)

# Console handler
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setFormatter(log_formatter)
logger.addHandler(console_handler)

logger = logging.getLogger(__name__)

MAX_PROBLEM_LENGTH = 10000
MAX_AGENTS = 10
RATE_LIMIT_REQUESTS = 30
RATE_LIMIT_WINDOW = 60

request_times: Dict[str, list] = defaultdict(list)


def check_rate_limit(client_id: str) -> bool:
    now = time.time()
    request_times[client_id] = [
        t for t in request_times[client_id] if now - t < RATE_LIMIT_WINDOW
    ]
    if len(request_times[client_id]) >= RATE_LIMIT_REQUESTS:
        return False
    request_times[client_id].append(now)
    return True


def sanitize_input(text: str, max_length: int = MAX_PROBLEM_LENGTH) -> str:
    if not text or not isinstance(text, str):
        return ""
    text = html.escape(text.strip())
    if len(text) > max_length:
        text = text[:max_length]
    return text


def validate_agent_config(agent: Dict[str, Any]) -> bool:
    if not isinstance(agent, dict):
        return False
    agent_id = agent.get("id")
    model = agent.get("model")
    if not agent_id or not model:
        return False
    if not re.match(r"^[\w\-.:]+$", str(agent_id)):
        return False
    if not re.match(r"^[\w\-.:]+$", model):
        return False
    return True


app = FastAPI(title="Agora Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.get("/api/models")
async def get_models():
    return get_model_discovery()


@app.get("/api/health")
async def health_check():
    return {"ollama_running": is_ollama_running()}


@app.post("/api/chat")
async def chat(chat_request: Dict[str, Any]):
    if not check_rate_limit("default"):
        return JSONResponse({"error": "Rate limit exceeded"}, status_code=429)

    problem = chat_request.get("problem", "")
    agents = chat_request.get("agents", [])

    problem = sanitize_input(problem)
    if not problem:
        return JSONResponse({"error": "Problem is required"}, status_code=400)

    if not isinstance(agents, list) or len(agents) > MAX_AGENTS:
        return JSONResponse({"error": "Invalid agents"}, status_code=400)

    valid_agents = [a for a in agents if validate_agent_config(a)]
    if not valid_agents:
        return JSONResponse({"error": "No valid agents provided"}, status_code=400)

    session_id = SessionManager.create_session(problem)

    return {"session_id": session_id, "status": "created"}


# Store active WebSocket connections
active_connections: Dict[str, WebSocket] = {}


async def generate_with_ollama(
    model: str, prompt: str, format: str = None, retries: int = 2
) -> str:
    """Generate a response from Ollama asynchronously with retry logic."""
    import httpx

    # Estimate timeout based on model size (larger models need more time)
    timeout_map = {
        "7b": 180.0,
        "8b": 200.0,
        "9b": 240.0,
        "14b": 300.0,
        "70b": 480.0,
    }
    base_timeout = 120.0
    for size, timeout in timeout_map.items():
        if size in model.lower():
            base_timeout = timeout
            break

    for attempt in range(retries + 1):
        try:
            async with httpx.AsyncClient() as client:
                payload = {"model": model, "prompt": prompt, "stream": False}
                if format:
                    payload["format"] = format

                response = await client.post(
                    "http://localhost:11434/api/generate",
                    json=payload,
                    timeout=base_timeout,
                )

                if response.status_code == 200:
                    data = response.json()
                    return data.get("response", "")
                elif response.status_code == 404:
                    return f"Error: Model '{model}' not found. Pull it with: ollama pull {model}"
                elif response.status_code == 500:
                    # Try fallback model on server error
                    if attempt < retries:
                        logger.warning(
                            f"Ollama 500 error with {model}, attempt {attempt + 1}/{retries}"
                        )
                        await asyncio.sleep(2)
                        continue
                    return f"Error: Ollama server error (500)"
                else:
                    return f"Error: Ollama returned status {response.status_code}"
        except httpx.TimeoutException:
            if attempt < retries:
                logger.warning(f"Timeout for {model}, attempt {attempt + 1}/{retries}")
                await asyncio.sleep(3)
                continue
            return f"Error: Request to {model} timed out after {retries + 1} attempts"
        except httpx.ConnectError:
            return "Error: Cannot connect to Ollama. Is it running?"
        except Exception as e:
            return f"Error: {str(e)}"

    return f"Error: Failed after {retries + 1} attempts"


class PlanRequest(BaseModel):
    problem: str
    agents: List[dict]


@app.post("/api/plan")
async def plan_session(req: PlanRequest):
    if not check_rate_limit("default"):
        return JSONResponse({"error": "Rate limit exceeded"}, status_code=429)

    problem = sanitize_input(req.problem)
    if not problem:
        return JSONResponse({"error": "Problem is required"}, status_code=400)

    # Fast fallback model to generate JSON, defaulting to the first agent's model or 'mistral'
    model = "mistral"
    for a in req.agents:
        if a.get("model"):
            model = a["model"]
            break

    prompt = f"""You are a facilitator organizing a debate/reasoning session of AI agents over the following prompt:
"{problem}"

There are {len(req.agents)} agents total.
Assign each agent an opposing, distinct, or complementary role.
Always make the final agent the evaluator/synthesizer/judge unless requested otherwise.

Output as strict JSON matching this schema exactly:
{{
  "type": "debate" | "analysis" | "problem_solving" | "research",
  "agents": [
    {{ "id": "agent_id_from_input", "role": "SHORT ROLE NAME", "stance": "one line exact description of their strict stance" }}
  ]
}}

The IDs must exactly match the list lengths provided.
Ids provided: {[a.get("id") for a in req.agents]}
    """
    import json

    try:
        output = await generate_with_ollama(model, prompt, format="json")
        parsed = json.loads(output)

        # Overlay any user manual overrides
        for i, a in enumerate(req.agents):
            user_role = str(a.get("role", "")).strip()
            if user_role and user_role.lower() != "auto":
                # User manually set this role, override the JSON
                if i < len(parsed.get("agents", [])):
                    parsed["agents"][i]["role"] = user_role
                    # Could update stance to reflect custom role if needed, but for now just overriding role.

        return parsed
    except Exception as e:
        logger.error(f"Plan generation failed: {e}")
        return JSONResponse({"error": f"Planning failed: {e}"}, status_code=500)


async def run_agent(
    websocket: WebSocket,
    board: SharedBoard,
    agent_config: dict,
    problem: str,
    history: list,
    other_agents_str: str,
):
    """Run a single agent — create thinking entry, generate response, update entry."""
    agent_id = sanitize_input(str(agent_config.get("id")))
    agent_role = str(agent_config.get("role", "Analyst")).strip()
    agent_stance = str(
        agent_config.get("stance", "Execute your assigned role natively.")
    )
    model = sanitize_input(agent_config.get("model"))
    logger.info(f"[Agent] Starting {agent_role} with model={model}")

    if not model:
        return

    is_evaluator = "judge" in agent_role.lower() or "synthesizer" in agent_role.lower()

    # Create a thinking entry
    entry = BoardEntry(
        agent_id=agent_id,
        agent_name=agent_role,
        model=model,
        content="",
        entry_type="claim",
    )
    board.add_entry(entry)

    # Send thinking state
    try:
        await websocket.send_json(
            {
                "type": "entry",
                "entry": entry.to_dict(),
                "thinking": True,
            }
        )
    except Exception as e:
        logger.warning(f"Send error (thinking): {e}")
        return

    if is_evaluator:
        prompt = f"You have observed the full exchange between:\n{other_agents_str}\n\n"
        prompt += f"Original Prompt: {problem}\n\n"
        prompt += f"Your job is to deliver a final verdict or synthesis based on your role: {agent_stance}. Be specific about which arguments were strongest and why. Do not take a side — evaluate the quality of reasoning.\n\n"

        prompt += "Conversation history so far:\n"
        if not history:
            prompt += "[No discussion occurred.]\n\n"
        else:
            for h in history:
                if h.get("content"):
                    prompt += f"[{h.get('agent')}]: {h.get('content')}\n"
        prompt += "\nYour Evaluation:\n"
    else:
        prompt = f"You are Agent {agent_id}. Your role in this session is {agent_role}: {agent_stance}.\n\n"
        prompt += f"Other agents participating in this session:\n{other_agents_str}\n"
        prompt += "Rules:\n"
        prompt += "- Stay strictly within your assigned role and stance for the entire session.\n"
        prompt += (
            "- Always address other agents by name when responding to their points.\n"
        )
        prompt += "- Do not repeat what you said in a previous round. Build on it or defend it when challenged.\n"
        prompt += "- Keep responses focused and under 150 words per round.\n\n"
        prompt += f"Original Prompt:\n{problem}\n\n"

        if not history:
            prompt += "[No conversation history yet. Start the debate!]\n\n"
        else:
            prompt += "Conversation history so far:\n"
            for h in history:
                if h.get("content"):
                    prompt += f"[{h.get('agent')}]: {h.get('content')}\n"

        prompt += (
            "Your Turn. Provide your response based on the conversation history:\n"
        )

    # Generate response from Ollama
    logger.info(f"[Agent] {agent_role} calling Ollama with model={model}...")
    content = await generate_with_ollama(model, prompt)
    logger.info(f"[Agent] {agent_role} got response: {len(content)} chars")
    entry.content = content

    # Send completed entry
    try:
        await websocket.send_json(
            {
                "type": "entry",
                "entry": entry.to_dict(),
                "thinking": False,
            }
        )
    except Exception as e:
        logger.warning(f"Send error (done): {e}")


@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()
    active_connections[session_id] = websocket
    logger.info(f"[WS] Session {session_id} connected")

    try:
        await websocket.send_json({"type": "connected", "session_id": session_id})

        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            logger.info(f"[WS] Received message type: {message.get('type')}")

            if message.get("type") == "chat":
                problem = message.get("problem", "")
                agents = message.get("agents", [])
                num_rounds = int(message.get("numRounds", 3))
                logger.info(
                    f"[WS] Chat request: problem='{problem[:50]}...', agents={len(agents)}, rounds={num_rounds}"
                )

                problem = sanitize_input(problem)
                if not problem:
                    await websocket.send_json(
                        {"type": "error", "message": "Invalid problem"}
                    )
                    continue

                if not isinstance(agents, list) or len(agents) > MAX_AGENTS:
                    await websocket.send_json(
                        {"type": "error", "message": "Invalid agents"}
                    )
                    continue

                for a in agents:
                    logger.info(
                        f"[WS] Agent check: id={a.get('id')}, model={a.get('model')}, valid={validate_agent_config(a)}"
                    )
                valid_agents = [a for a in agents if validate_agent_config(a)]
                logger.info(f"[WS] Valid agents: {len(valid_agents)}/{len(agents)}")
                if not valid_agents:
                    await websocket.send_json(
                        {"type": "error", "message": "No valid agents"}
                    )
                    continue

                ws_session_id = SessionManager.create_session(problem)
                board = SessionManager.get_board(ws_session_id)

                await websocket.send_json({"type": "problem", "content": problem})

                participants = [
                    a
                    for a in valid_agents
                    if "judge" not in a.get("role", "").lower()
                    and "synthesizer" not in a.get("role", "").lower()
                ]
                judges = [
                    a
                    for a in valid_agents
                    if "judge" in a.get("role", "").lower()
                    or "synthesizer" in a.get("role", "").lower()
                ]

                other_agents_str = ""
                for a in valid_agents:
                    other_agents_str += f"- Agent {a.get('id')} is {a.get('role')} ({a.get('stance', '')})\n"

                # Execute turn-based multi-round conversation
                for round_idx in range(num_rounds):
                    logger.info(f"[WS] Starting round {round_idx + 1}/{num_rounds}")
                    history_snapshot = board.get_entries()
                    tasks = [
                        run_agent(
                            websocket,
                            board,
                            a,
                            problem,
                            history_snapshot,
                            other_agents_str,
                        )
                        for a in participants
                    ]
                    if tasks:
                        await asyncio.gather(*tasks)

                # Execute final evaluation round for judges
                if judges:
                    logger.info(f"[WS] Starting Judge/Synthesizer evaluation round")
                    history_snapshot = board.get_entries()
                    tasks = [
                        run_agent(
                            websocket,
                            board,
                            a,
                            problem,
                            history_snapshot,
                            other_agents_str,
                        )
                        for a in judges
                    ]
                    await asyncio.gather(*tasks)

                await websocket.send_json({"type": "done"})

    except WebSocketDisconnect:
        logger.info(f"Client disconnected from session {session_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        active_connections.pop(session_id, None)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
