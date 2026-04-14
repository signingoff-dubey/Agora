# Progress Log

## Current Version: v0.2.0
## Status: Ready for Testing

---

## [v0.2.0] — 2026-04-14
### What's New
- Apple-inspired minimal UI redesign
- Pure black theme (#000000) with Apple Blue (#0071e3) accent
- Pill-style agent selectors and buttons
- Hero-style layout with clean typography
- run.bat - one-click solution to start everything

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