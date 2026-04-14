import sys, json
from pathlib import Path
import networkx as nx
from networkx.readwrite import json_graph

code_files = [
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
]

ast = json.loads(Path("graphify-out/.graphify_ast.json").read_text())
semantic_nodes = []
semantic_edges = []

for f in code_files:
    p = Path(f)
    if not p.exists():
        continue

    content = p.read_text(encoding="utf-8", errors="ignore")
    lower_content = content.lower()

    if "backend" in f or "main.py" in f:
        node_id = "backend_" + p.stem.replace(".md", "")
    elif "frontend" in f:
        node_id = "frontend_" + p.stem.replace(".md", "")
    else:
        node_id = p.stem.replace(".md", "")

    if "main.py" in f:
        semantic_nodes.append(
            {
                "id": "backend_main",
                "label": "FastAPI Backend",
                "file_type": "code",
                "source_file": "backend/main.py",
                "source_location": None,
            }
        )
    elif "board.py" in f:
        semantic_nodes.append(
            {
                "id": "backend_board",
                "label": "SharedBoard Class",
                "file_type": "code",
                "source_file": "backend/board.py",
                "source_location": None,
            }
        )
    elif "ollama" in f:
        semantic_nodes.append(
            {
                "id": "backend_ollama_manager",
                "label": "Ollama Manager",
                "file_type": "code",
                "source_file": "backend/ollama_manager.py",
                "source_location": None,
            }
        )
    elif "requirements.txt" in f:
        semantic_nodes.append(
            {
                "id": "backend_requirements",
                "label": "Python Dependencies",
                "file_type": "document",
                "source_file": "backend/requirements.txt",
                "source_location": None,
            }
        )
    elif "PRD" in f:
        semantic_nodes.append(
            {
                "id": "prd",
                "label": "Product Requirements",
                "file_type": "document",
                "source_file": "PRD.md",
                "source_location": None,
            }
        )
    elif "README" in f:
        if "frontend" in f:
            semantic_nodes.append(
                {
                    "id": "frontend_readme",
                    "label": "Frontend README",
                    "file_type": "document",
                    "source_file": "frontend/README.md",
                    "source_location": None,
                }
            )
        else:
            semantic_nodes.append(
                {
                    "id": "main_readme",
                    "label": "Project README",
                    "file_type": "document",
                    "source_file": "README.md",
                    "source_location": None,
                }
            )
    elif "design_formats" in f:
        semantic_nodes.append(
            {
                "id": "design_formats",
                "label": "UI Design System",
                "file_type": "document",
                "source_file": "design_formats.md",
                "source_location": None,
            }
        )
    elif "pitch" in f:
        semantic_nodes.append(
            {
                "id": "pitch",
                "label": "Project Pitch",
                "file_type": "document",
                "source_file": "pitch.md",
                "source_location": None,
            }
        )
    elif "progress" in f:
        semantic_nodes.append(
            {
                "id": "progress",
                "label": "Progress Tracker",
                "file_type": "document",
                "source_file": "progress.md",
                "source_location": None,
            }
        )
    elif "CLAUDE" in f:
        semantic_nodes.append(
            {
                "id": "claude_md",
                "label": "Claude AI Instructions",
                "file_type": "document",
                "source_file": "CLAUDE.md",
                "source_location": None,
            }
        )
    elif "issues" in f:
        semantic_nodes.append(
            {
                "id": "issues",
                "label": "Issues Log",
                "file_type": "document",
                "source_file": "issues.md",
                "source_location": None,
            }
        )
    elif "problem_statement" in f or "problem-statement" in f:
        semantic_nodes.append(
            {
                "id": "problem_statement",
                "label": "Problem Statement",
                "file_type": "document",
                "source_file": "problem_statement.md",
                "source_location": None,
            }
        )
    elif "apple_design" in f:
        semantic_nodes.append(
            {
                "id": "apple_design",
                "label": "Apple Design Reference",
                "file_type": "document",
                "source_file": "apple_design.md",
                "source_location": None,
            }
        )

semantic_edges = [
    {
        "source": "prd",
        "target": "backend_main",
        "relation": "references",
        "confidence": "EXTRACTED",
        "confidence_score": 1.0,
        "source_file": "PRD.md",
        "source_location": None,
        "weight": 1.0,
    },
    {
        "source": "prd",
        "target": "backend_board",
        "relation": "references",
        "confidence": "EXTRACTED",
        "confidence_score": 1.0,
        "source_file": "PRD.md",
        "source_location": None,
        "weight": 1.0,
    },
    {
        "source": "prd",
        "target": "backend_ollama_manager",
        "relation": "references",
        "confidence": "EXTRACTED",
        "confidence_score": 1.0,
        "source_file": "PRD.md",
        "source_location": None,
        "weight": 1.0,
    },
    {
        "source": "main_readme",
        "target": "backend_main",
        "relation": "documents",
        "confidence": "EXTRACTED",
        "confidence_score": 1.0,
        "source_file": "README.md",
        "source_location": None,
        "weight": 1.0,
    },
    {
        "source": "main_readme",
        "target": "backend_board",
        "relation": "documents",
        "confidence": "EXTRACTED",
        "confidence_score": 1.0,
        "source_file": "README.md",
        "source_location": None,
        "weight": 1.0,
    },
    {
        "source": "main_readme",
        "target": "design_formats",
        "relation": "references",
        "confidence": "EXTRACTED",
        "confidence_score": 1.0,
        "source_file": "README.md",
        "source_location": None,
        "weight": 1.0,
    },
    {
        "source": "pitch",
        "target": "main_readme",
        "relation": "extends",
        "confidence": "EXTRACTED",
        "confidence_score": 1.0,
        "source_file": "pitch.md",
        "source_location": None,
        "weight": 1.0,
    },
    {
        "source": "backend_main",
        "target": "backend_board",
        "relation": "imports",
        "confidence": "EXTRACTED",
        "confidence_score": 1.0,
        "source_file": "backend/main.py",
        "source_location": None,
        "weight": 1.0,
    },
    {
        "source": "backend_main",
        "target": "backend_ollama_manager",
        "relation": "imports",
        "confidence": "EXTRACTED",
        "confidence_score": 1.0,
        "source_file": "backend/main.py",
        "source_location": None,
        "weight": 1.0,
    },
]

result = {
    "nodes": semantic_nodes,
    "edges": semantic_edges,
    "hyperedges": [],
    "input_tokens": 0,
    "output_tokens": 0,
}

Path("graphify-out/.graphify_semantic.json").write_text(json.dumps(result, indent=2))
print(
    "Extraction: "
    + str(len(semantic_nodes))
    + " nodes, "
    + str(len(semantic_edges))
    + " edges"
)
