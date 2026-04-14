# PRD — Concurrent Multi-Agent Collaborative Reasoning System
**Version:** 0.2  
**Author:** Kabir  
**Status:** Draft  
**Date:** April 2026  
**Changelog:** Added Ollama integration, model discovery, UI layout spec, workflow mindmap, thinking indicators, API key fallback

---

## 1. Problem Statement

Single-model AI reasoning is a one-pass process. It cannot disagree with itself, catch its own blind spots mid-thought, or handle competing constraints in parallel. Sequential agent pipelines (agent A → B → C) solve for specialization but not for concurrency — each agent is still a lone thinker waiting for a handoff.

The real gap is in **collaborative concurrent reasoning** — multiple agents working on the same problem simultaneously, reacting to each other's partial, live outputs, converging on an answer the way a high-functioning team would.

---

## 2. Goal

Build a locally-hosted system where:
- Multiple AI agents (powered by local Ollama models) start simultaneously on the same problem
- Agents write to and read from a shared live workspace
- Agents react to each other's **intermediate** outputs, not just final ones
- The user can see every agent thinking, reacting, and passing outputs in real time
- The user can visualize the entire reasoning flow as a live mindmap
- No API keys required by default — everything runs on-device via Ollama

---

## 3. Non-Goals

- Not a chatbot. No single agent drives the conversation.
- Not a sequential pipeline.
- Not a cloud-first product (v1 is entirely local).
- No auth, accounts, or persistence across sessions (v1).

---

## 4. Project Structure

```
/project-root
  design_formats.md          ← UI design system (colors, fonts, spacing, components)
  /backend
    main.py
    board.py
    session.py
    ollama_manager.py        ← Model discovery + availability
    agents/
    llm/
    models/
  /frontend
    src/
      components/
      hooks/
      store/
    public/
  README.md
```

### 4.1 design_formats.md

A dedicated file at the project root that defines all UI design decisions:
- Color palette (primary, background, surface, accent, error, text hierarchy)
- Typography (font family, sizes for headings / body / labels / code)
- Spacing scale
- Border radius, shadow levels
- Component specs: chat bubble, agent card, dropdown, popup, mindmap node styles
- Animation specs: thinking indicator, board update flash, mindmap edge draw

All frontend components must reference this file's decisions. It is the single source of truth for design.

---

## 5. Ollama Integration

### 5.1 Model Discovery

On page load (and on manual refresh), the frontend calls the backend which queries the local Ollama server:

```
GET http://localhost:11434/api/tags   →  returns installed models
```

Backend parses the response and returns two lists to the frontend:
- **Installed models** — available for immediate use as agents
- **Available models** — a curated list of recommended Ollama-compatible models not yet installed

### 5.2 Available (Not Installed) Models

The backend maintains a static curated list of recommended models (e.g., `llama3`, `mistral`, `gemma2`, `phi3`, `qwen2`, `deepseek-r1`).

Any model in this list that does NOT appear in the Ollama tags response is surfaced in the UI as "Available — not installed."

### 5.3 Install Popup

When a user clicks an available (not installed) model anywhere in the UI, a modal appears:

```
┌────────────────────────────────────────┐
│  Install mistral                       │
│                                        │
│  Run this command in your terminal:    │
│                                        │
│  > ollama pull mistral          [Copy] │
│                                        │
│  After installation, refresh the page │
│  to use this model as an agent.        │
│                                        │
│                          [Close]       │
└────────────────────────────────────────┘
```

### 5.4 Auto-Detection on Refresh

No polling. On every page load, the backend re-queries Ollama. If a new model was pulled since last load, it appears automatically in all agent dropdowns.

### 5.5 Ollama Not Running

If the backend cannot reach `localhost:11434`, the UI shows a dedicated error screen:

```
┌─────────────────────────────────────────┐
│  Ollama is not running                  │
│                                         │
│  Start it with:  ollama serve   [Copy]  │
│                                         │
│  Then refresh this page.                │
└─────────────────────────────────────────┘
```

---

## 6. UI Layout

### 6.1 Main Page Overview

```
┌─────────────────────────────────────────────────────┐
│  LOGO / APP NAME              [Agent 1][Agent 2][+] │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │                                              │   │
│  │           LIVE BOARD / CHAT AREA             │   │
│  │    (agent thoughts, reactions, outputs)      │   │
│  │                                              │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  [Workflow]  Type your problem...         [▶] │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 6.2 Agent Panels (Top Right)

A horizontal row of agent cards fixed to the top-right of the header. Each card represents one active agent slot.

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Agent 1     │  │  Agent 2     │  │  Agent 3     │
│  [mistral ▼] │  │  [llama3 ▼]  │  │  [gemma2 ▼]  │
└──────────────┘  └──────────────┘  └──────────────┘
                                          [+ Add Agent]
```

**Dropdown contents for each agent:**

```
  ● mistral           ← installed, selectable
  ● llama3            ← installed, selectable
  ─────────────────
  ○ gemma2            ← not installed, click → install popup
  ○ phi3              ← not installed, click → install popup
  ─────────────────
  🔑 Enter API Key    ← connects this agent slot to a cloud LLM
```

- Installed models shown with a filled dot
- Uninstalled models shown with an empty dot — clicking opens the install popup
- "Enter API Key" at the bottom allows OpenRouter / OpenAI / Anthropic as fallback for that agent slot only

### 6.3 Live Board Area

The main content area shows a live feed of agent activity. Each entry is a card:

```
┌─────────────────────────────────────────────┐
│  🤖 Agent 1 · mistral              10:42:03 │
│  ─────────────────────────────────────────  │
│  ● ● ●  (thinking indicator — animated)     │
└─────────────────────────────────────────────┘

↓ once tokens start streaming:

┌─────────────────────────────────────────────┐
│  🤖 Agent 1 · mistral              10:42:03 │
│  ─────────────────────────────────────────  │
│  The core issue here is that the system...  │
│                                             │
│  → Sending to Agent 2                       │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  🤖 Agent 2 · llama3               10:42:05 │
│  ─────────────────────────────────────────  │
│  ← Receiving from Agent 1                  │
│  ● ● ●                                      │
└─────────────────────────────────────────────┘
```

Send/receive arrows are explicit in the card — the user always knows which agent fed which.

### 6.4 Chat Input Bar (Bottom)

- Full-width input bar pinned to the bottom
- Placeholder text: `"Describe a problem, decision, or question..."`
- **Workflow button** on the left — opens the mindmap view
- **Send / Run button** on the right — starts the concurrent session

### 6.5 Thinking Indicator

When an agent is mid-inference (before first token arrives), display:
- Animated `● ● ●` (three dots pulsing sequentially)
- OR a small rotating logo styled to design_formats.md

Once the first token streams in, the indicator is replaced by the streaming text.

---

## 7. Workflow Mindmap View

### 7.1 Trigger

Clicking the **Workflow** button opens a full-screen overlay showing the live reasoning graph.

### 7.2 Structure

Directed acyclic graph (in most cases):

```
                    [User Prompt]
                          │
           ┌──────────────┼──────────────┐
           ▼              ▼              ▼
       [Agent 1]      [Agent 2]      [Agent 3]
           │              │
           └──────┬────────┘
                  ▼
          [Agent 2 reacts]
                  │
                  ▼
           [Synthesizer]
                  │
                  ▼
            [Final Answer]
```

- **Root node:** User prompt
- **Agent nodes:** One node per board entry posted by an agent
- **Edges:** Directed arrows — each edge is labeled with a truncated snippet of the output being passed (first ~10 words)
- **Real-time:** Nodes and edges appear as the session progresses
- **Thinking state:** Node pulses / shows spinner while the agent is still generating
- **Color coding:** Each agent has a consistent color across the board and the mindmap (defined in design_formats.md)
- **Click to expand:** Clicking any node shows the full output for that entry inline

### 7.3 Library

**React Flow** — supports dynamic node/edge addition, custom node components, animated edges, and real-time graph updates without re-renders.

---

## 8. Core Backend Concepts

### 8.1 Shared Board

A central thread-safe state object. Every write to the board:
1. Acquires a lock
2. Appends the entry
3. Releases the lock
4. Broadcasts a WebSocket event to all connected frontend clients

### 8.2 Agents

Each agent is an Ollama streaming call in its own thread. An agent:
- Receives the original problem on session start
- Watches the board for new peer entries
- Streams its response back token-by-token via WebSocket
- Posts its final output to the board, triggering peer reactions

### 8.3 Reactive Triggering

An agent is triggered when:
- The session starts (all agents fire simultaneously)
- A peer posts a new entry the agent's role makes relevant
- A conflict is flagged on the board

### 8.4 Convergence

A Synthesizer agent monitors the board and calls convergence when:
- All agents have posted at least once and activity slows
- Agreement is detectable across entries
- Unresolvable conflict → surfaces both sides explicitly in the final output

---

## 9. Shared Board Schema

```json
{
  "session_id": "uuid",
  "problem": "string",
  "status": "running | converging | done",
  "entries": [
    {
      "id": "uuid",
      "agent": "agent_1",
      "model": "mistral",
      "timestamp": "ISO8601",
      "type": "claim | reaction | update | conclusion",
      "content": "string",
      "reacting_to": "entry_id | null",
      "sent_to": ["agent_2"],
      "confidence": 0.85
    }
  ],
  "conflicts": [
    {
      "between": ["agent_1", "agent_2"],
      "on": "entry_id",
      "resolved": false
    }
  ],
  "graph": {
    "nodes": [{ "id": "uuid", "agent": "string", "label": "string", "status": "thinking | done" }],
    "edges": [{ "from": "uuid", "to": "uuid", "snippet": "string" }]
  },
  "conclusion": "string | null"
}
```

---

## 10. Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11, FastAPI |
| LLM Runtime | Ollama (local, `localhost:11434`) |
| LLM Fallback | OpenRouter / OpenAI via per-agent API key |
| Concurrency | `threading` (v1) |
| Real-time | WebSockets (FastAPI native) |
| Frontend | React + Tailwind CSS |
| Mindmap | React Flow |
| State (v1) | In-memory Python dict |
| State (v2) | Redis |
| Deployment | Localhost (v1) |

---

## 11. MVP Scope (v1)

### In Scope
- Ollama model discovery (installed + available curated list)
- Install instruction popup for uninstalled models
- "Ollama not running" error screen
- 3 concurrent agents with shared board
- Agent panel (top right) with per-agent model dropdowns
- API key fallback per agent slot
- Live board with thinking indicators (animated dots)
- Send/receive arrows between agent cards
- Token streaming via WebSocket
- Workflow mindmap (React Flow) updating in real time
- `design_formats.md` as single source of truth for UI

### Out of Scope for v1
- Persistent sessions / history
- Agent memory across sessions
- User-defined agent roles / custom system prompts
- Multi-user
- Auth

---

## 12. Success Metrics (v1)

| Metric | Target |
|---|---|
| All agents start within 500ms of each other | ✓ |
| Board update visible on UI within 1s of agent post | ✓ |
| Mindmap node appears when agent posts | ✓ |
| Newly pulled Ollama model detected on page refresh | ✓ |
| Thinking indicator shows during inference | ✓ |
| At least 1 reactive post per session (agent reacting to peer) | ✓ |
| Send/receive arrows correctly reflect data flow | ✓ |

---

## 13. Open Questions

1. Does Ollama streaming (`/api/generate` stream: true) relay cleanly over the FastAPI WebSocket?
2. Should the mindmap be full-screen overlay or a resizable side panel?
3. Maximum agents cap — suggested 5 before board becomes unreadable.
4. Should API key be stored in localStorage or only held in session memory?
5. Should the `+ Add Agent` button have a maximum or warn past 4 agents?
6. Should the Synthesizer be a hidden system agent or a visible agent card in the UI?

---

## 14. Milestones

| Milestone | Deliverable |
|---|---|
| M0 | `design_formats.md` finalized — all UI decisions locked |
| M1 | Ollama discovery endpoint — installed + available models returned |
| M2 | Shared board + 2 concurrent Ollama agents posting (terminal only) |
| M3 | FastAPI + WebSocket backend streaming tokens from Ollama |
| M4 | React UI — live board, agent cards, thinking indicators, send/receive arrows |
| M5 | Agent panel dropdowns — installed models, install popup, API key fallback |
| M6 | Workflow mindmap (React Flow) updating in real time |
| M7 | Full end-to-end session on localhost |

---

*This PRD is a living document. Update with every milestone completion.*
