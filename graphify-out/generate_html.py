import json
import networkx as nx
from networkx.readwrite import json_graph
from pathlib import Path

extraction = json.loads(Path("graphify-out/.graphify_extract.json").read_text())
analysis = json.loads(Path("graphify-out/.graphify_analysis.json").read_text())
labels = json.loads(Path("graphify-out/.graphify_labels.json").read_text())

G = nx.Graph()
for n in extraction["nodes"]:
    G.add_node(n["id"], **n)
for e in extraction["edges"]:
    if "weight" not in e:
        e["weight"] = 1.0
    G.add_edge(e["source"], e["target"], **e)

communities = {int(k): v for k, v in analysis["communities"].items()}

colors = [
    "#0071e3",
    "#ff6b6b",
    "#4ecdc4",
    "#45b7d1",
    "#96ceb4",
    "#ffeaa7",
    "#dfe6e9",
    "#fd79a8",
    "#a29bfe",
    "#00b894",
    "#e17055",
    "#74b9ff",
    "#81ecec",
    "#fab1a0",
    "#ff7675",
    "#636e72",
    "#2d3436",
]

nodes_list = []
for nid in G.nodes():
    node = G.nodes[nid]
    node_id = nid
    label = node.get("label", nid)

    comm_id = 0
    for c_id, comm_nodes in communities.items():
        if nid in comm_nodes:
            comm_id = c_id
            break

    color = colors[comm_id % len(colors)]
    nodes_list.append(
        {
            "id": node_id,
            "label": label,
            "color": color,
            "community": comm_id,
            "file_type": node.get("file_type", "unknown"),
        }
    )

edges_list = []
for u, v, data in G.edges(data=True):
    edges_list.append(
        {
            "source": u,
            "target": v,
            "relation": data.get("relation", "related"),
            "confidence": data.get("confidence", "EXTRACTED"),
            "weight": data.get("weight", 1.0),
        }
    )

html = """<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Agora Knowledge Graph</title>
    <script src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #000; color: #fff; overflow: hidden;
        }
        #network { width: 100vw; height: 100vh; }
        .legend {
            position: fixed; top: 20px; right: 20px;
            background: rgba(30,30,30,0.9);
            padding: 15px; border-radius: 12px;
            font-size: 12px; max-height: 80vh; overflow-y: auto;
        }
        .legend h3 { margin-bottom: 10px; color: #0071e3; }
        .legend-item { display: flex; align-items: center; margin: 5px 0; }
        .legend-color { 
            width: 12px; height: 12px; border-radius: 50%;
            margin-right: 8px;
        }
        .title {
            position: fixed; top: 20px; left: 20px;
            font-size: 24px; font-weight: 600;
        }
        .subtitle {
            position: fixed; top: 55px; left: 20px;
            font-size: 14px; color: #666;
        }
    </style>
</head>
<body>
    <div class="title">Agora Knowledge Graph</div>
    <div class="subtitle">81 nodes, 78 edges, 17 communities</div>
    <div id="network"></div>
    <div class="legend">
        <h3>Communities</h3>
"""

for cid, label in labels.items():
    color = colors[int(cid) % len(colors)]
    html += f'<div class="legend-item"><div class="legend-color" style="background:{color}"></div>{label}</div>\n'

html += (
    """    </div>
    <script>
        var nodes = new vis.DataSet("""
    + json.dumps(nodes_list)
    + """);
        var edges = new vis.DataSet("""
    + json.dumps(edges_list)
    + """);
        
        var container = document.getElementById('network');
        var data = { nodes: nodes, edges: edges };
        var options = {
            nodes: {
                shape: 'dot',
                size: 15,
                font: { color: '#fff', size: 11 }
            },
            edges: {
                width: 1,
                color: { color: '#333', highlight: '#0071e3' },
                smooth: { type: 'continuous' }
            },
            physics: {
                forceAtlas2Based: { gravitationalConstant: -50, springLength: 100 },
                solver: 'forceAtlas2Based',
                stabilization: { iterations: 100 }
            },
            interaction: { hover: true, tooltipDelay: 200 }
        };
        
        var network = new vis.Network(container, data, options);
        
        network.on("click", function(params) {
            if (params.nodes.length > 0) {
                var node = nodes.get(params.nodes[0]);
                console.log("Clicked:", node);
            }
        });
    </script>
</body>
</html>"""
)

Path("graphify-out/graph.html").write_text(html)
print("graph.html written")
