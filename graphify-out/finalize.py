import json
from pathlib import Path
from datetime import datetime, timezone

detect = {
    "total_files": 27,
    "total_words": 15668,
    "files": {
        "code": [
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
        ],
        "document": [
            "apple_design.md",
            "CLAUDE.md",
            "design_formats.md",
            "issues.md",
            "pitch.md",
            "PRD.md",
            "problem_statement.md",
            "progress.md",
            "README.md",
            "backend/requirements.txt",
            "frontend/README.md",
        ],
        "image": [
            "frontend/public/favicon.svg",
            "frontend/public/icons.svg",
            "frontend/src/assets/hero.png",
            "frontend/src/assets/react.svg",
            "frontend/src/assets/vite.svg",
        ],
    },
}

Path("graphify-out/manifest.json").write_text(json.dumps(detect, indent=2))

cost_path = Path("graphify-out/cost.json")
if cost_path.exists():
    cost = json.loads(cost_path.read_text())
else:
    cost = {"runs": [], "total_input_tokens": 0, "total_output_tokens": 0}

extract = json.loads(Path("graphify-out/.graphify_extract.json").read_text())
input_tok = extract.get("input_tokens", 0)
output_tok = extract.get("output_tokens", 0)

cost["runs"].append(
    {
        "date": datetime.now(timezone.utc).isoformat(),
        "input_tokens": input_tok,
        "output_tokens": output_tok,
        "files": detect["total_files"],
    }
)
cost["total_input_tokens"] += input_tok
cost["total_output_tokens"] += output_tok
cost_path.write_text(json.dumps(cost, indent=2))

print(
    "This run: "
    + str(input_tok)
    + " input tokens, "
    + str(output_tok)
    + " output tokens"
)
print(
    "All time: "
    + str(cost["total_input_tokens"])
    + " input, "
    + str(cost["total_output_tokens"])
    + " output ("
    + str(len(cost["runs"]))
    + " runs)"
)
