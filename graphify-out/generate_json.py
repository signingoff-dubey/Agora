import json
import networkx as nx
from networkx.readwrite import json_graph
from pathlib import Path

extraction = json.loads(Path("graphify-out/.graphify_extract.json").read_text())

G = nx.Graph()
for n in extraction["nodes"]:
    G.add_node(n["id"], **n)
for e in extraction["edges"]:
    if "weight" not in e:
        e["weight"] = 1.0
    G.add_edge(e["source"], e["target"], **e)

data = json_graph.node_link_graph(G, edges="links")
Path("graphify-out/graph.json").write_text(json.dumps(data, indent=2))
print("graph.json written")
