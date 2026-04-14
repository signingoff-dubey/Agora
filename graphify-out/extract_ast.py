import sys, json
from graphify.extract import collect_files, extract
from pathlib import Path
import json

code_files = []
for f in [
    "backend/board.py",
    "backend/main.py",
    "backend/ollama_manager.py",
    "frontend/eslint.config.js",
    "frontend/vite.config.js",
    "frontend/src/App.jsx",
    "frontend/src/main.jsx",
    "frontend/src/components/InstallPopup.jsx",
    "frontend/src/components/OllamaError.jsx",
    "frontend/src/components/WorkflowMap.jsx",
    "frontend/src/hooks/useWebSocket.js",
]:
    code_files.append(Path(f))

if code_files:
    result = extract(code_files)
    Path("graphify-out/.graphify_ast.json").write_text(json.dumps(result, indent=2))
    print(
        "AST: "
        + str(len(result["nodes"]))
        + " nodes, "
        + str(len(result["edges"]))
        + " edges"
    )
else:
    Path("graphify-out/.graphify_ast.json").write_text(
        json.dumps({"nodes": [], "edges": [], "input_tokens": 0, "output_tokens": 0})
    )
    print("No code files - skipping AST extraction")
