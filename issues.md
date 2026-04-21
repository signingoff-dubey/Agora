# Issues & Fixes Log

> AI: Read this file before debugging. If the same issue occurred before, the fix is already here.

---

## [ISSUE-001] — 2026-04-14
**Title:** WebSocket Race Conditions
**Symptom:** UI disconnected immediately or hanged, throwing CORS bounds.
**Root Cause:** Synchronous `time.sleep` and blocking thread execution within the ASGI FastAPI websocket endpoints locked the event loop, destroying connection. Also `useWebSocket` triggered connection states improperly on mount.
**Fix:** Converted `run_agent` to `async/await`, switched requests to `httpx.AsyncClient()`, and re-architected `useWebSocket.js`.
**Files Changed:** `main.py`, `useWebSocket.js`
**Status:** Fixed

---

## [ISSUE-002] — 2026-04-14
**Title:** White text over minimap controls in UI
**Symptom:** Workflow overlay was invisible due to white on white coloring.
**Root Cause:** React Flow defaults heavily relied on light-mode CSS that did not adhere to the global body styling.
**Fix:** Added `colorMode="dark"` property natively to `ReactFlow` which perfectly conforms it to our dark slate `#0F172A` theme.
**Files Changed:** `WorkflowMap.jsx`
**Status:** Fixed

---

## [ISSUE-003] — 2026-04-14
**Title:** Ollama API Generation 404 Disconnect
**Symptom:** Submitting queries to Ollama produced `Error: Ollama returned status 404` directly inside chat bubbles.
**Root Cause:** The system queried system LLMs and intentionally stripped tags (`:7b`, `:14b`) so "qwen2.5-coder:14b" became "qwen2.5-coder". The UI then submitted requests against base names, pushing Ollama to search for implicit `:latest` tags yielding a 404.
**Fix:** Removed the tag-stripping logic natively; UI now correctly displays and routes back fully qualified tag names.
**Files Changed:** `ollama_manager.py`
**Status:** Fixed

---

## [ISSUE-004] — 2026-04-14
**Title:** Missing Markdown Chaining & Execution Isolation
**Symptom:** Output strings rendered bare single `*` formatting un-styled, and models simply generated duplicate content unrelated to one another.
**Root Cause:** Agents executed purely concurrently and responses were piped strictly as plain string nodes into the UI.
**Fix:** Installed `react-markdown`. Modified execution logic to loop sequentially and dynamically append the `board` shared state chat-history directly into the trailing agent prompts.
**Files Changed:** `main.py`, `App.jsx`, `App.css`, `package.json`
**Status:** Fixed

---

## [ISSUE-005] — 2026-04-14
**Title:** Models Execute Independently Without Interaction
**Symptom:** Agents generated independent, disjointed responses to the initial prompt. The UI showed disconnected parallel replies with no cross-referencing or organic argument.
**Root Cause:** The execution chain was architected as a parallel batch process where every agent triggered its response sequentially via `yield` loops without retaining structural turns or evaluating peer responses.
**Fix:** Created an inherent 3-round conversational loop wrapping `asyncio.gather` with forced synchronized `History` snapshots. System meta-prompts explicitly define opposing agents and force adherence through identity constraints.
**Files Changed:** `main.py`, `App.jsx`
**Status:** Fixed

---

## [ISSUE-006] — 2026-04-15
**Title:** Ollama Timeout and 500 Errors
**Symptom:** Errors displayed as "Error: Request to qwen3.5:9b timed out" and "Error: Ollama returned status 500" directly in agent chat bubbles.
**Root Cause:** Fixed 120-second timeout is insufficient for larger models (9b, 14b, 70b). No retry logic existed for transient server errors.
**Fix:** 
- Added dynamic timeout calculation based on model size (7b=180s, 9b=240s, 14b=300s, 70b=480s)
- Implemented retry logic with exponential backoff (2 retries by default)
- Added specific error handling for 404 (model not found) with helpful message
- Added specific handling for 500 errors to retry automatically
**Files Changed:** `main.py`
**Status:** Fixed

---

## [ISSUE-007] — 2026-04-15
**Title:** Add Theme Support with Settings Button
**Symptom:** UI lacked customization options and theme switching capability.
**Root Cause:** No theme system existed in the application.
**Fix:** 
- Added 5 themes: Dark, Light, Neomorphism Dark, Neomorphism Light, Glassmorphism
- Added settings button at bottom right with gear icon
- Settings modal with theme selector (visual preview for each)
- CSS variables for all themes with smooth transitions
- Glassmorphism includes backdrop blur effects
- Fixed button overflow by repositioning workflow button above settings
**Files Changed:** `App.jsx`, `App.css`
**Status:** Fixed

---

## [ISSUE-008] — 2026-04-15
**Title:** Workflow Map Nodes Show Insufficient Information
**Symptom:** Workflow nodes only displayed agent name and model, lacking detailed information about content, timestamps, and session context.
**Root Cause:** Simple label-only nodes without custom styling or data display.
**Fix:** 
- Created custom AgentNode component with header showing agent name, role, model, timestamp
- Content preview showing first 120 characters of agent response
- Thinking/waiting state indicator with pulsing animation
- Color-coded borders matching agent colors
- Problem node with gradient header showing the user's problem
- Grid layout for multiple agents (3 columns)
- MiniMap with dynamic node colors
**Files Changed:** `WorkflowMap.jsx`, `App.css`
**Status:** Fixed