# Progress Log

## Current Version: v1.6
## Status: Stable / Deployed

---

## [v1.6] — 2026-04-15
### What's New
- Fixed timeout and 500 errors for large models (qwen3.5:9b, etc.)
- Added dynamic timeout based on model size (7b=180s, 9b=240s, 14b=300s, 70b=480s)
- Implemented retry logic (2 retries) for transient Ollama errors
- Added 404 error handling with helpful "ollama pull" instructions
- Added 5 theme options: Dark, Light, Neomorphism Dark, Neomorphism Light, Glassmorphism
- Added settings button at bottom right with theme selector
- Fixed workflow/settings button overflow issue
- Glassmorphism buttons now have transparent frosted look with backdrop blur
- Neomorphism available in both dark and light variants
- Enhanced WorkflowMap with smart nodes showing agent name, role, model, timestamp, content preview
- Thinking/waiting state indicator with pulsing animation
- Grid layout for multiple agents in workflow view

### Known Issues
- Ollama streaming token-by-token output is currently offline, falling back to full-string batch resolves.
- API key fallback UI exists but backend routes are disabled until OpenRouter is integrated.

### Future Scope
- Real-time typed text streaming via WebSockets.
- Fully integrating the graphical workflow view node connections with backend agent chaining.

---

## [v1.5] — 2026-04-14
### What's New
- Re-architected backend entirely using `async/await` and `httpx.AsyncClient` for robust, high-performance concurrency.
- Implemented real sequential reasoning (`main.py` chaining) where agents pass context down the pipeline to respond directly to prior agent statements.
- Native ReactMarkdown integration to faithfully render Markdown syntax from agents (bolding, lists, code snippets).
- Re-styled entire application natively matching the dark slate & indigo `design_formats.md` palette (`#0F172A`).
- Fixed workflow react-flow layout with native dark mode support replacing previous white-on-white text issues.
- Fixed 404 API generation errors by modifying how local models with specific size tags (`:14b`, `:7b`) correctly map mapped into Ollama.
- Overhauled and stabilized WebSocket event lifecycle, with proper queued connection refactor in `useWebSocket`.
- Embedded unified backend logging piped directly to `agora.log` providing robust debug trails.

### Known Issues
- Ollama streaming token-by-token output is currently offline, falling back to full-string batch resolves.
- API key fallback UI exists but backend routes are disabled until OpenRouter is integrated.

### Future Scope
- Real-time typed text streaming via WebSockets.
- Fully integrating the graphical workflow view node connections with backend agent chaining.

---

## [v0.1.2] — 2026-04-14
### What's New
- Apple-inspired minimal UI redesign

### Known Issues
- Ollama streaming needs real-time token-by-token output
- API key fallback not integrated in backend

### Future Scope
- Per-agent streaming with token-by-token display
- Backend API key integration (OpenAI/OpenRouter)
- Session persistence

---

## [v0.1.0] — 2026-04-14
### What's New
- Initial project setup
- PRD.md with full product specification
- README.md with project documentation
- design_formats.md (UI design system)
- M0: design_formats.md - full UI design system
- M1: backend/ollama_manager.py - Ollama model discovery
- M2: backend/board.py - SharedBoard, BoardEntry, SessionManager
- M3: backend/main.py - FastAPI + WebSocket + /api/chat
- M4: frontend/src/App.jsx - Main React component
- M5: InstallPopup component + API key fallback
- M6: WorkflowMap component with React Flow

---

## Git History
| Commit | Date | Message |
|--------|------|---------|
| abc1234 | 2026-04-14 | Initial commit |
| 4e0e193 | 2026-04-14 | M0-M3: Design + Backend + Frontend scaffold |
| 92310f9 | 2026-04-14 | M0-M6: Full implementation |
| e0c9868 | 2026-04-14 | Apple-inspired minimal UI + run.bat |