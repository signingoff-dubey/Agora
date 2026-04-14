import json
from pathlib import Path

analysis = json.loads(Path("graphify-out/.graphify_analysis.json").read_text())

labels = {
    "0": "Board Entry Model",
    "1": "Shared Board State",
    "2": "FastAPI Backend",
    "3": "Ollama Manager",
    "4": "ESLint Config",
    "5": "Vite Config",
    "6": "React App + Hooks",
    "7": "Ollama Error Component",
    "8": "Install + Workflow Components",
    "9": "Apple Design Reference",
    "10": "Claude Instructions",
    "11": "Project Documentation",
    "12": "Issues Log",
    "13": "Problem Statement",
    "14": "Progress Tracker",
    "15": "Python Dependencies",
    "16": "Frontend README",
}

Path("graphify-out/.graphify_labels.json").write_text(json.dumps(labels, indent=2))

extraction = json.loads(Path("graphify-out/.graphify_extract.json").read_text())

report = "# Graph Report - Agora\n\n"
report += "## Corpus\n\n- 27 files (~16k words)\n- 11 code files, 11 docs, 5 images\n\n"
report += "## Graph Stats\n\n- 81 nodes, 78 edges, 17 communities\n\n"
report += "## God Nodes (Most Connected)\n\n"
for g in analysis["gods"]:
    report += "- " + g + "\n"

report += "\n## Surprising Connections\n\n"
for s in analysis["surprises"]:
    report += "- " + s + "\n"

report += "\n## Community Labels\n\n"
for cid, label in labels.items():
    cohesion = analysis["cohesion"].get(cid, 0)
    report += "- " + label + " (cohesion: " + str(round(cohesion, 2)) + ")\n"

report += "\n## Suggested Questions\n\n"
report += "- How does the backend connect to Ollama?\n"
report += "- What components make up the live board?\n"
report += "- How does the frontend communicate with the backend?\n"

Path("graphify-out/GRAPH_REPORT.md").write_text(report)
print("Report written")
