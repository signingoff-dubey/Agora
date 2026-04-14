import { useCallback, useEffect } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

const AGENT_COLORS = {
  1: '#06B6D4',
  2: '#8B5CF6',
  3: '#F59E0B',
  4: '#F43F5E',
  5: '#10B981',
}

export function WorkflowMap({ entries, isOpen, onClose }) {
  const initialNodes = [
    {
      id: 'problem',
      data: { label: 'User Problem' },
      position: { x: 250, y: 0 },
      style: { 
        background: '#1E293B', 
        border: '2px solid #4F46E5',
        borderRadius: '12px',
        padding: '12px 16px',
        color: '#FFFFFF',
      },
    },
  ]
  
  const initialEdges = []

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  useEffect(() => {
    if (!entries || entries.length === 0) return
    
    const newNodes = entries.map((entry, idx) => ({
      id: entry.id,
      data: { label: `${entry.agent} · ${entry.model}` },
      position: { x: 100 + (idx * 150), y: 150 },
      style: { 
        background: '#1E293B', 
        border: `2px solid ${AGENT_COLORS[entry.agentId] || AGENT_COLORS[1]}`,
        borderRadius: '12px',
        padding: '12px 16px',
        color: '#FFFFFF',
      },
    }))
    
    const newEdges = entries.slice(1).map((entry, idx) => ({
      id: `e${idx}`,
      source: entries[idx].id,
      target: entry.id,
      animated: !entry.content,
      style: { stroke: AGENT_COLORS[entries[idx].agentId] || AGENT_COLORS[1] },
    }))
    
    if (entries.length > 0 && initialNodes.length === 1) {
      newEdges.unshift({
        id: 'e-problem',
        source: 'problem',
        target: entries[0].id,
        animated: !entries[0].content,
        style: { stroke: '#4F46E5' },
      })
    }
    
    setNodes(prev => {
      const problemNode = prev.find(n => n.id === 'problem')
      return problemNode ? [...prev, ...newNodes] : [...prev, ...newNodes]
    })
    
    setEdges(newEdges)
  }, [entries])

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  if (!isOpen) return null

  return (
    <div className="workflow-overlay" onClick={onClose}>
      <div className="workflow-container" onClick={e => e.stopPropagation()}>
        <div className="workflow-header">
          <h2>Workflow</h2>
          <button className="close-workflow-btn" onClick={onClose}>×</button>
        </div>
        <div className="workflow-graph">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
          >
            <Background color="#334155" gap={20} />
            <Controls />
            <MiniMap 
              nodeColor={(node) => node.style?.border?.split(' ')[2] || '#4F46E5'}
              maskColor="rgba(15, 23, 42, 0.8)"
            />
          </ReactFlow>
        </div>
      </div>
    </div>
  )
}