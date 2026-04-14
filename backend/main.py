from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import json
from typing import Dict, Any, List
import asyncio
import threading

from ollama_manager import get_model_discovery, is_ollama_running, get_installed_models
from board import BoardEntry, SharedBoard, SessionManager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Agora Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
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
    problem = chat_request.get("problem", "")
    agents = chat_request.get("agents", [])

    if not problem:
        return JSONResponse({"error": "Problem is required"}, status_code=400)

    session_id = SessionManager.create_session(problem)
    board = SessionManager.get_board(session_id)

    def run_agents():
        for agent_config in agents:
            agent_id = agent_config.get("id")
            agent_role = agent_config.get("role", "Analyst")
            model = agent_config.get("model")

            if not model:
                continue

            entry = BoardEntry(
                agent_id=agent_id,
                agent_name=f"Agent {agent_id}",
                model=model,
                content=f"Analyzing: {problem[:100]}...",
                entry_type="claim",
                reacting_to=None,
                sent_to=[],
            )
            board.add_entry(entry)

            broadcast_entry(session_id, {"type": "entry", "entry": entry.to_dict()})

    thread = threading.Thread(target=run_agents)
    thread.start()
    thread.join()

    return {"session_id": session_id, "entries": board.get_entries()}


active_connections: Dict[str, WebSocket] = {}


@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()
    active_connections[session_id] = websocket

    try:
        await websocket.send_json({"type": "connected", "session_id": session_id})

        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            if message.get("type") == "chat":
                problem = message.get("problem", "")
                agents = message.get("agents", [])

                session_id = SessionManager.create_session(problem)
                board = SessionManager.get_board(session_id)

                await broadcast_entry(
                    session_id, {"type": "problem", "content": problem}
                )

                for agent_config in agents:
                    agent_id = agent_config.get("id")
                    model = agent_config.get("model")

                    if not model:
                        continue

                    entry = BoardEntry(
                        agent_id=agent_id,
                        agent_name=f"Agent {agent_id}",
                        model=model,
                        content="",
                        entry_type="claim",
                    )

                    board.add_entry(entry)

                    await broadcast_entry(
                        session_id,
                        {"type": "entry", "entry": entry.to_dict(), "thinking": True},
                    )

                    content = await generate_with_ollama(model, problem)
                    entry.content = content

                    await broadcast_entry(
                        session_id,
                        {"type": "entry", "entry": entry.to_dict(), "thinking": False},
                    )

                await broadcast_entry(session_id, {"type": "done"})

    except WebSocketDisconnect:
        logger.info(f"Client disconnected from session {session_id}")
    finally:
        active_connections.pop(session_id, None)


async def generate_with_ollama(model: str, prompt: str) -> str:
    import httpx

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://localhost:11434/api/generate",
                json={"model": model, "prompt": prompt, "stream": False},
                timeout=60.0,
            )

            if response.status_code == 200:
                data = response.json()
                return data.get("response", "")
            else:
                return f"Error generating response with {model}"
    except Exception as e:
        return f"Error: {str(e)}"


async def broadcast_entry(session_id: str, message: Dict[str, Any]):
    if session_id in active_connections:
        try:
            await active_connections[session_id].send_json(message)
        except Exception as e:
            logger.warning(f"Broadcast error: {e}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
