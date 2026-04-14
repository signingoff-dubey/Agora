import sys, json
import networkx as nx
from networkx.algorithms import community
from pathlib import Path

extraction = json.loads(Path("graphify-out/.graphify_extract.json").read_text())

G = nx.Graph()

for n in extraction["nodes"]:
    G.add_node(n["id"], **n)

for e in extraction["edges"]:
    if "weight" not in e:
        e["weight"] = 1.0
    G.add_edge(e["source"], e["target"], **e)

print(
    "Graph: "
    + str(G.number_of_nodes())
    + " nodes, "
    + str(G.number_of_edges())
    + " edges"
)

communities_generator = community.louvain_communities(G, seed=42)
communities = {}
for i, comm in enumerate(communities_generator):
    for node in comm:
        communities[node] = i

cohesion = {}
for i, comm in enumerate(communities_generator):
    subgraph = G.subgraph(comm)
    if len(comm) > 1:
        edges_internal = subgraph.number_of_edges()
        possible = len(comm) * (len(comm) - 1) // 2
        cohesion[i] = edges_internal / possible if possible > 0 else 0.0
    else:
        cohesion[i] = 1.0

degrees = dict(G.degree())
gods = sorted(degrees.items(), key=lambda x: x[1], reverse=True)[:5]

betweenness = nx.betweenness_centrality(G)
surprises = sorted(betweenness.items(), key=lambda x: x[1], reverse=True)[:3]

labels = {}
for i, comm in enumerate(communities_generator):
    if len(comm) > 0:
        sample = list(comm)[:3]
        label_content = ", ".join([n for n in sample[:2]])
        labels[i] = "Community " + str(i) + " (" + label_content + ")"

result = {
    "communities": {str(k): list(v) for k, v in enumerate(communities_generator)},
    "cohesion": {str(k): v for k, v in cohesion.items()},
    "gods": [g[0] for g in gods],
    "surprises": [s[0] for s in surprises],
    "labels": labels,
}

Path("graphify-out/.graphify_analysis.json").write_text(json.dumps(result, indent=2))
print(
    "Graph: "
    + str(G.number_of_nodes())
    + " nodes, "
    + str(G.number_of_edges())
    + " edges, "
    + str(len(communities_generator))
    + " communities"
)
