# Graph Report - .  (2026-04-15)

## Corpus Check
- Corpus is ~19,931 words - fits in a single context window. You may not need a graph.

## Summary
- 57 nodes · 62 edges · 20 communities detected
- Extraction: 85% EXTRACTED · 15% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Main Chat API|Main Chat API]]
- [[_COMMUNITY_Board Session Management|Board Session Management]]
- [[_COMMUNITY_Data Models|Data Models]]
- [[_COMMUNITY_Ollama Integration|Ollama Integration]]
- [[_COMMUNITY_React App Root|React App Root]]
- [[_COMMUNITY_Install Popup|Install Popup]]
- [[_COMMUNITY_Ollama Error Display|Ollama Error Display]]
- [[_COMMUNITY_Workflow Map Component|Workflow Map Component]]
- [[_COMMUNITY_WebSocket Hook|WebSocket Hook]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_Vite Config|Vite Config]]
- [[_COMMUNITY_React Entry Point|React Entry Point]]
- [[_COMMUNITY_Build Graph Script|Build Graph Script]]
- [[_COMMUNITY_Extract Script|Extract Script]]
- [[_COMMUNITY_AST Extract Script|AST Extract Script]]
- [[_COMMUNITY_Finalize Script|Finalize Script]]
- [[_COMMUNITY_Generate HTML Script|Generate HTML Script]]
- [[_COMMUNITY_Generate JSON Script|Generate JSON Script]]
- [[_COMMUNITY_Label Communities Script|Label Communities Script]]
- [[_COMMUNITY_Semantic Extract Script|Semantic Extract Script]]

## God Nodes (most connected - your core abstractions)
1. `SharedBoard` - 10 edges
2. `BoardEntry` - 6 edges
3. `sanitize_input()` - 5 edges
4. `PlanRequest` - 5 edges
5. `run_agent()` - 5 edges
6. `SessionManager` - 4 edges
7. `chat()` - 4 edges
8. `generate_with_ollama()` - 4 edges
9. `plan_session()` - 4 edges
10. `websocket_endpoint()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Generate a response from Ollama asynchronously.` --uses--> `BoardEntry`  [INFERRED]
  backend\main.py → backend\board.py
- `PlanRequest` --uses--> `SharedBoard`  [INFERRED]
  backend\main.py → backend\board.py
- `Generate a response from Ollama asynchronously.` --uses--> `SharedBoard`  [INFERRED]
  backend\main.py → backend\board.py
- `Run a single agent — create thinking entry, generate response, update entry.` --uses--> `SharedBoard`  [INFERRED]
  backend\main.py → backend\board.py
- `Generate a response from Ollama asynchronously.` --uses--> `SessionManager`  [INFERRED]
  backend\main.py → backend\board.py

## Communities

### Community 0 - "Main Chat API"
Cohesion: 0.33
Nodes (9): chat(), check_rate_limit(), generate_with_ollama(), plan_session(), Generate a response from Ollama asynchronously., run_agent(), sanitize_input(), validate_agent_config() (+1 more)

### Community 1 - "Board Session Management"
Cohesion: 0.22
Nodes (2): create_session(), SharedBoard

### Community 2 - "Data Models"
Cohesion: 0.33
Nodes (5): BaseModel, BoardEntry, SessionManager, PlanRequest, Run a single agent — create thinking entry, generate response, update entry.

### Community 3 - "Ollama Integration"
Cohesion: 0.47
Nodes (5): get_installed_models(), get_model_discovery(), is_ollama_running(), Returns a list of installed model names, or an empty list on failure., Returns model discovery info for the frontend.

### Community 4 - "React App Root"
Cohesion: 1.0
Nodes (0): 

### Community 5 - "Install Popup"
Cohesion: 1.0
Nodes (0): 

### Community 6 - "Ollama Error Display"
Cohesion: 1.0
Nodes (0): 

### Community 7 - "Workflow Map Component"
Cohesion: 1.0
Nodes (0): 

### Community 8 - "WebSocket Hook"
Cohesion: 1.0
Nodes (0): 

### Community 9 - "ESLint Config"
Cohesion: 1.0
Nodes (0): 

### Community 10 - "Vite Config"
Cohesion: 1.0
Nodes (0): 

### Community 11 - "React Entry Point"
Cohesion: 1.0
Nodes (0): 

### Community 12 - "Build Graph Script"
Cohesion: 1.0
Nodes (0): 

### Community 13 - "Extract Script"
Cohesion: 1.0
Nodes (0): 

### Community 14 - "AST Extract Script"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Finalize Script"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "Generate HTML Script"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Generate JSON Script"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Label Communities Script"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Semantic Extract Script"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **2 isolated node(s):** `Returns a list of installed model names, or an empty list on failure.`, `Returns model discovery info for the frontend.`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `React App Root`** (2 nodes): `App()`, `App.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Install Popup`** (2 nodes): `InstallPopup.jsx`, `InstallPopup()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Ollama Error Display`** (2 nodes): `OllamaError.jsx`, `OllamaError()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Workflow Map Component`** (2 nodes): `WorkflowMap.jsx`, `WorkflowMap()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `WebSocket Hook`** (2 nodes): `useWebSocket.js`, `useWebSocket()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `ESLint Config`** (1 nodes): `eslint.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Vite Config`** (1 nodes): `vite.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `React Entry Point`** (1 nodes): `main.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Build Graph Script`** (1 nodes): `build_graph.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Extract Script`** (1 nodes): `do_extract.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `AST Extract Script`** (1 nodes): `extract_ast.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Finalize Script`** (1 nodes): `finalize.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Generate HTML Script`** (1 nodes): `generate_html.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Generate JSON Script`** (1 nodes): `generate_json.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Label Communities Script`** (1 nodes): `label_communities.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Semantic Extract Script`** (1 nodes): `semantic_extract.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SharedBoard` connect `Board Session Management` to `Main Chat API`, `Data Models`?**
  _High betweenness centrality (0.108) - this node is a cross-community bridge._
- **Why does `PlanRequest` connect `Data Models` to `Main Chat API`, `Board Session Management`?**
  _High betweenness centrality (0.096) - this node is a cross-community bridge._
- **Why does `BoardEntry` connect `Data Models` to `Main Chat API`, `Board Session Management`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `SharedBoard` (e.g. with `PlanRequest` and `Generate a response from Ollama asynchronously.`) actually correct?**
  _`SharedBoard` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `BoardEntry` (e.g. with `PlanRequest` and `Generate a response from Ollama asynchronously.`) actually correct?**
  _`BoardEntry` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `PlanRequest` (e.g. with `BoardEntry` and `SharedBoard`) actually correct?**
  _`PlanRequest` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Returns a list of installed model names, or an empty list on failure.`, `Returns model discovery info for the frontend.` to the rest of the system?**
  _2 weakly-connected nodes found - possible documentation gaps or missing edges._