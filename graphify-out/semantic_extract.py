import json
from pathlib import Path

# Non-code files to extract (docs + images + code files)
all_files = [
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
    "frontend/public/favicon.svg",
    "frontend/public/icons.svg",
    "frontend/src/assets/hero.png",
    "frontend/src/assets/react.svg",
    "frontend/src/assets/vite.svg",
]

# Split into chunks (max 25 per chunk)
chunks = []
for i in range(0, len(all_files), 25):
    chunks.append(all_files[i : i + 25])

print(json.dumps({"chunks": chunks, "total": len(all_files)}))
