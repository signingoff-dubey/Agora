# Agora

> A place where minds meet. Multiple AI agents reason together — concurrently, reactively, and in real time.

Agora is a locally-hosted multi-agent reasoning system where several AI models powered by Ollama work on the same problem simultaneously. They share a live workspace, react to each other's partial outputs mid-thought, and converge on answers through genuine back-and-forth — not a sequential pipeline.

---

## What Makes Agora Different

Most "multi-agent" systems are just sequential pipelines. Agent A finishes, then Agent B starts. That is not collaboration — that is a waterfall with extra branding.

Agora is built around a different model:

- All agents start at the same time
- Every agent can read from and react to a shared board as it updates live
- No agent waits for another to finish — they respond to each other's **partial, in-progress thoughts**
- Conflicts between agents are detected and surfaced explicitly — not auto-resolved and hidden
- The entire reasoning flow is visualized as a live mindmap showing exactly what output fed what input

---

## Features

### 🧠 Concurrent Multi-Agent Reasoning
Multiple agents fire simultaneously on the same problem. Each agent has a role (Analyst, Critic, Specialist, Synthesizer) and a different model assigned to it. They work in parallel threads, reading and writing to a shared board in real time.

### 🔄 Reactive Live Board
The shared board is not a static document — it updates as agents post. When one agent posts a finding, other agents react to it immediately, not after it finishes. The board is an append-only event log — no overwriting, no lost history.

### 🖥️ Fully Local — Powered by Ollama
No API keys required. Agora detects all models installed on your local Ollama instance and makes them available as agents. Everything runs on your machine.

### 🔍 Model Discovery
On page load, Agora scans your Ollama installation and shows:
- **Installed models** — ready to assign to agents immediately
- **Available models** — recommended models not yet installed, with one-click install instructions

### 📦 Per-Agent Model Selection
Each agent slot has an independent dropdown. You can run `mistral` as Agent 1 and `llama3` as Agent 2 in the same session. You can also fall back to a cloud model (OpenRouter / OpenAI) for any individual agent slot by entering an API key — without affecting other agents.

### 🗺️ Live Workflow Mindmap
A dedicated Workflow view shows the entire reasoning session as a directed graph — updating in real time as the session progresses. Every agent post is a node. Every data handoff is a labeled edge showing what was passed. Click any node to expand the full output.

### 💬 Streaming Thinking Display
Every agent shows its thinking process live — tokens stream in as the model generates. A pulsing indicator shows when an agent is mid-inference. Send and receive arrows in the board make data flow explicit — you always know which agent fed which.

### ⚡ Conflict Detection
When two agents post contradictory claims, Agora flags the conflict explicitly on the board and in the mindmap. Conflicts are not auto-resolved — they are surfaced for the user and for the Synthesizer agent to address.

### 🎨 Apple-Inspired Minimal UI
The UI follows Apple's design principles:
- Pure black (#000000) background with Apple Blue (#0071e3) accent
- SF Pro-style typography with tight letter-spacing
- Pill-style controls instead of boxes
- No unnecessary borders or chrome
- Product-as-hero layout

---

## How It Works

```
User submits a problem
        │
        ▼
All agents start simultaneously
        │
   ┌────┴────┐
   │         │
Agent 1   Agent 2   Agent 3  ...
   │         │         │
   └────┬────┘         │
        │              │
   Posts to        Reads board
   shared board    reacts live
        │
        ▼
  Synthesizer monitors board
  detects convergence or conflict
        │
        ▼
   Final answer + full reasoning thread
```

Each agent is a role-prompted Ollama call running in its own thread. The shared board is a thread-safe append-only log. Every write to the board is immediately broadcast to the frontend via WebSocket — so the UI updates the moment an agent posts anything.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11, FastAPI |
| LLM Runtime | Ollama (local, `localhost:11434`) |
| LLM Fallback | OpenRouter / OpenAI (per-agent API key) |
| Concurrency | Python `threading` |
| Real-time | WebSockets (FastAPI native) |
| Frontend | React, Tailwind CSS |
| Mindmap | React Flow |
| State (v1) | In-memory Python dict (append-only log) |
| State (v2) | Redis |

---

## Project Structure

```
agora/
├── design_formats.md          # UI design system — single source of truth
├── README.md
├── run.bat                  # One-click launcher
├── apple_design.md           # Apple design reference
│
├── backend/
│   ├── main.py                # FastAPI app, WebSocket endpoint
│   ├── board.py               # Shared board state (thread-safe, append-only)
│   ├── session.py             # Session lifecycle management
│   ├── ollama_manager.py      # Model discovery + curated available list
│   ├── requirements.txt        # Python dependencies
│   ├── agents/
│   │   ├── base_agent.py      # Base class: prompt builder, LLM caller, board writer
│   │   ├── analyst.py
│   │   ├── critic.py
│   │   ├── specialist.py
│   │   └── synthesizer.py
│   ├── llm/
│   │   ├── router.py          # Ollama + API key fallback wrapper
│   │   └── prompts.py         # All agent system prompts
│   └── models/
│       ├── board_entry.py     # BoardEntry schema
│       └── session.py         # Session schema
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx              # Main component
        ├── App.css              # Apple-inspired styles
        ├── index.css
        ├── main.jsx
        ├── components/
        │   ├── InstallPopup.jsx
        │   ├── OllamaError.jsx
        │   └── WorkflowMap.jsx
        └── hooks/
            └── useWebSocket.js
        │   ├── AgentPanel.jsx       # Agent cards + model dropdowns (top right)
        │   ├── LiveBoard.jsx        # Real-time board feed
        │   ├── AgentCard.jsx        # Per-agent post with thinking indicator
        │   ├── WorkflowMap.jsx      # React Flow mindmap
        │   ├── ConflictFlag.jsx     # Conflict highlight component
        │   ├── InstallPopup.jsx     # Ollama pull instruction modal
        │   ├── FinalAnswer.jsx      # Synthesizer conclusion display
        │   └── OllamaError.jsx      # "Ollama not running" screen
        ├── hooks/
        │   └── useWebSocket.js     # WebSocket connection + event handler
        └── store/
            └── boardStore.js       # Local board state (React state)
```

---

## Getting Started

### Prerequisites

- [Ollama](https://ollama.com) installed and running
- At least one model pulled (`ollama pull mistral` recommended)
- Python 3.11+
- Node.js 18+

### Quick Start (Recommended)

Simply double-click `run.bat` in the project folder. It will:
1. Start Ollama
2. Start the backend (port 8000)
3. Start the frontend (port 5173)
4. Open http://localhost:5173 in your browser

### Manual Start

### 1. Start Ollama

```bash
ollama serve
```

Verify it is running at `http://localhost:11434`.

### 2. Clone and Set Up Backend

```bash
git clone https://github.com/signingoff-dubey/agora
cd agora/backend

pip install -r requirements.txt
python main.py
```

### 3. Start Frontend

```bash
cd agora/frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### 4. Run a Session

1. Open the app — Agora will auto-detect your installed Ollama models
2. Assign a model to each agent slot using the dropdowns (top right)
3. Type your problem in the input bar
4. Hit Run — all agents start simultaneously
5. Watch the live board and open Workflow to see the reasoning graph

---

## Model Recommendations

| Model | Best For | Size |
|---|---|---|
| `mistral` | Analyst, general reasoning | 4.1 GB |
| `llama3` | Critic, argumentation | 4.7 GB |
| `gemma2` | Specialist, deep focus | 5.4 GB |
| `phi3` | Lightweight second agent | 2.3 GB |
| `deepseek-r1` | Complex reasoning tasks | 4.7 GB |

For best results, assign different model families to different agent slots. Same model running twice produces less divergent thinking.

---

## Using a Cloud Model Fallback

If you want one agent to use a cloud LLM (e.g., for a more powerful reasoner alongside local agents):

1. Open the model dropdown for any agent
2. Click **🔑 Enter API Key** at the bottom of the dropdown
3. Paste your OpenRouter or OpenAI key
4. Select your cloud model

The API key applies only to that agent slot. Other agents continue using local Ollama models.

---

## Roadmap

| Version | Focus |
|---|---|
| v1.0 | Core concurrent agents, live board, Ollama discovery, workflow mindmap |
| v1.1 | User-configurable agent roles and custom system prompts |
| v1.2 | Session export (JSON + PDF) |
| v2.0 | Graphiti integration — persistent cross-session knowledge graph |
| v2.1 | Redis-backed board for scalable state |
| v2.2 | Agent memory — agents remember previous sessions |

---

## Architecture Decisions

**Why append-only log for the board?**
Concurrent writes to a mutable structure require locking on every read and write. An append-only log means agents only ever add entries — no overwrites, no lock contention on reads, and a full auditable history of the reasoning session by default.

**Why not LangGraph or AutoGen?**
Both are orchestration frameworks that impose a graph or pipeline structure on agent flow. Agora's core design is emergent — agents react to each other without a central orchestrator deciding who speaks next. Building this from primitives (threads + WebSockets + a shared log) gives full control over the concurrency model and the UI data flow.

**Why Ollama first?**
Privacy, speed, and zero cost per inference. A reasoning session with 4 agents reacting to each other can generate 30–60 LLM calls. That is expensive on a cloud API and introduces latency. Local inference eliminates both problems.

**Why React Flow for the mindmap?**
It handles dynamic node and edge insertion without full re-renders, supports custom node components, and has animated edge support natively. Building this from scratch with D3 would work but adds significant complexity for the same result.

---

## Contributing

Pull requests are welcome. For major changes, open an issue first.

```
git clone https://github.com/signingoff-dubey/agora
```

---

## License

MIT

---

*Built by Kabir — RV University, School of CSE, Bangalore*
