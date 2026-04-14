# Project Pitch

## One-Line Pitch

Agora — multiple AI agents reason together concurrently, reactively, and in real time.

## The Problem

Single-model AI reasoning is a one-pass process. It cannot disagree with itself, catch its own blind spots mid-thought, or handle competing constraints in parallel. A single model finishes its answer in one go — there's no internal check, cross-examination, or collaboration with other perspectives.

## Our Solution

A locally-hosted multi-agent reasoning system where several AI models powered by Ollama work on the same problem simultaneously. They share a live workspace, react to each other's partial outputs mid-thought, and converge on answers through genuine back-and-forth — not a sequential pipeline.

## Key Features

- Concurrent multi-agent reasoning (3+ agents running simultaneously)
- Reactive live board with real-time updates
- Fully local — powered by Ollama, no API keys required
- Model discovery (installed + available curated list)
- Per-agent model selection with API key fallback
- Live workflow mindmap visualization
- Streaming thinking display with indicators
- Explicit conflict detection and surfacing

## Target Audience

- Developers building AI-powered applications
- Researchers exploring multi-agent collaboration
- Power users needing high-quality reasoning on complex problems

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11, FastAPI |
| LLM Runtime | Ollama (local, localhost:11434) |
| LLM Fallback | OpenRouter / OpenAI (per-agent API key) |
| Concurrency | Python threading |
| Real-time | WebSockets |
| Frontend | React, Tailwind CSS |
| Mindmap | React Flow |

## Why Us / Why Now

- **Privacy**: All inference runs locally on your machine
- **Speed**: No API latency — local models are faster
- **Zero cost**: No per-token billing — run unlimited sessions
- **Emergent collaboration**: Agents react to each other's in-progress thinking, not just final outputs

## Demo / Screenshots

The UI features:
- Agent panels (top right) with model dropdowns
- Live board showing agent thoughts with thinking indicators
- Workflow button to open the mindmap view
- Send/receive arrows showing data flow between agents
- Streaming tokens as agents generate responses

## Team

Built by Kabir — RV University, School of CSE, Bangalore