import { useCallback, useEffect, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

const AGENT_COLORS = {
  1: '#06B6D4',
  2: '#8B5CF6',
  3: '#F59E0B',
  4: '#F43F5E',
  5: '#10B981',
}

function AgentNode({ data }) {
  const color = data.agentColor || AGENT_COLORS[1]
  const isThinking = data.thinking
  
  const isJudge = data.role?.toLowerCase().includes('judge') || data.role?.toLowerCase().includes('evaluator') || data.role?.toLowerCase().includes('synthesizer')
  
  return (
    <div style={{
      background: 'var(--surface, #1E293B)',
      border: `2px solid ${isJudge ? '#F59E0B' : color}`,
      borderRadius: '14px',
      padding: '0',
      minWidth: '280px',
      maxWidth: '340px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      overflow: 'hidden',
    }}>
      <Handle type="target" position={Position.Top} style={{ background: isJudge ? '#F59E0B' : color }} />
      
      {/* Header with Agent Name & Role */}
      <div style={{
        background: isJudge ? 'rgba(245, 158, 11, 0.15)' : `${color}15`,
        padding: '10px 14px',
        borderBottom: `1px solid ${color}30`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: isThinking ? '#F59E0B' : (isJudge ? '#F59E0B' : color),
            animation: isThinking ? 'pulse 1s infinite' : 'none',
            boxShadow: isThinking ? '0 0 8px #F59E0B' : 'none',
          }} />
          <span style={{ color: '#FFF', fontSize: '13px', fontWeight: '700' }}>
            {data.agent}
          </span>
        </div>
        <span style={{ 
          color: isJudge ? '#F59E0B' : color, 
          fontSize: '10px', 
          fontWeight: '600',
          background: isJudge ? 'rgba(245, 158, 11, 0.2)' : `${color}20`,
          padding: '2px 8px',
          borderRadius: '8px',
        }}>
          {data.role || 'Agent'}
        </span>
      </div>
      
      {/* Body */}
      <div style={{ padding: '12px 14px' }}>
        {/* Model & Time */}
        <div style={{ color: '#64748B', fontSize: '10px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ background: '#334155', padding: '2px 6px', borderRadius: '4px' }}>
            {data.model}
          </span>
          <span>{data.timestamp}</span>
        </div>
        
        {/* Stance */}
        {data.stance && (
          <div style={{ 
            background: 'rgba(79, 70, 229, 0.15)', 
            borderLeft: `3px solid ${color}`,
            padding: '8px 10px',
            marginBottom: '8px',
            borderRadius: '0 6px 6px 0',
          }}>
            <div style={{ color: '#94A3B8', fontSize: '9px', marginBottom: '3px', textTransform: 'uppercase', fontWeight: '600' }}>
              Stance
            </div>
            <div style={{ color: '#E2E8F0', fontSize: '11px', lineHeight: '1.4' }}>
              {data.stance.length > 80 ? data.stance.substring(0, 80) + '...' : data.stance}
            </div>
          </div>
        )}
        
        {/* Content / Thought */}
        {data.content ? (
          <div style={{ 
            background: '#0F172A',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '10px',
            maxHeight: '120px',
            overflow: 'auto',
          }}>
            <div style={{ color: '#64748B', fontSize: '9px', marginBottom: '6px', textTransform: 'uppercase', fontWeight: '600' }}>
              Response ({data.content.length} chars)
            </div>
            <div style={{ 
              color: '#CBD5E1', 
              fontSize: '11px', 
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {data.content}
            </div>
          </div>
        ) : (
          <div style={{ 
            background: '#0F172A',
            border: '1px dashed #334155',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center',
          }}>
            <div style={{ color: '#64748B', fontSize: '12px', fontStyle: 'italic' }}>
              {isThinking ? '🤔 Generating response...' : '⏳ Waiting for turn...'}
            </div>
          </div>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} style={{ background: isJudge ? '#F59E0B' : color }} />
    </div>
  )
}

function ProblemNode({ data }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
      border: '2px solid #6366F1',
      borderRadius: '14px',
      padding: '0',
      minWidth: '320px',
      maxWidth: '400px',
      boxShadow: '0 8px 32px rgba(79, 70, 229, 0.4)',
    }}>
      <Handle type="source" position={Position.Bottom} style={{ background: '#6366F1' }} />
      
      <div style={{ padding: '14px 18px' }}>
        <div style={{ color: '#A5B4FC', fontSize: '11px', fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>❓</span> Problem Statement
        </div>
        <div style={{ color: '#FFFFFF', fontSize: '14px', lineHeight: '1.6', fontWeight: '500' }}>
          {data.problem}
        </div>
        {data.agentCount && (
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.2)', display: 'flex', gap: '12px', fontSize: '11px', color: '#A5B4FC' }}>
            <span>👥 {data.agentCount} Agents</span>
            <span>🔄 {data.rounds} Rounds</span>
          </div>
        )}
      </div>
    </div>
  )
}

const nodeTypes = {
  agent: AgentNode,
  problem: ProblemNode,
}

export function WorkflowMap({ entries, isOpen, onClose, rounds = 3, agentCount = 0 }) {
  const problem = useMemo(() => {
    return entries[0]?.problem || 'Multi-agent reasoning session'
  }, [entries])

  const initialNodes = useMemo(() => [
    {
      id: 'problem',
      type: 'problem',
      data: { problem, agentCount, rounds },
      position: { x: 400, y: 0 },
    },
  ], [problem, agentCount, rounds])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  useEffect(() => {
    if (!entries || entries.length === 0) {
      setNodes([{ id: 'problem', type: 'problem', data: { problem, agentCount, rounds }, position: { x: 400, y: 0 } }])
      setEdges([])
      return
    }

    const nonJudgeEntries = entries.filter(e => !e.agent?.toLowerCase().includes('judge') && !e.agent?.toLowerCase().includes('evaluator') && !e.agent?.toLowerCase().includes('synthesizer'))
    const judgeEntries = entries.filter(e => e.agent?.toLowerCase().includes('judge') || e.agent?.toLowerCase().includes('evaluator') || e.agent?.toLowerCase().includes('synthesizer'))
    
    const agentNodes = [
      ...nonJudgeEntries.map((entry, idx) => ({
        id: entry.id,
        type: 'agent',
        data: { 
          agent: entry.agent,
          agentId: entry.agentId,
          agentColor: AGENT_COLORS[(idx % 4) + 1],
          model: entry.model,
          role: entry.agent,
          stance: entry.stance || '',
          content: entry.content,
          timestamp: formatTime(entry.timestamp),
          thinking: !entry.content,
        },
        position: { 
          x: 80 + (idx % 3) * 350, 
          y: 180 + Math.floor(idx / 3) * 200 
        },
      })),
      ...judgeEntries.map((entry, idx) => ({
        id: entry.id,
        type: 'agent',
        data: { 
          agent: entry.agent,
          agentId: entry.agentId,
          agentColor: '#F59E0B',
          model: entry.model,
          role: entry.agent,
          stance: entry.stance || '',
          content: entry.content,
          timestamp: formatTime(entry.timestamp),
          thinking: !entry.content,
        },
        position: { 
          x: 400, 
          y: 180 + (nonJudgeEntries.length + idx) * 200 
        },
      }))
    ]

    const newEdges = []
    
    if (entries.length > 0) {
      newEdges.push({
        id: 'e-problem',
        source: 'problem',
        target: entries[0].id,
        style: { stroke: '#4F46E5', strokeWidth: 2 },
        animated: !entries[0].content,
      })
    }

    for (let i = 0; i < entries.length - 1; i++) {
      newEdges.push({
        id: `e-${i}-${i+1}`,
        source: entries[i].id,
        target: entries[i+1].id,
        style: { 
          stroke: entries[i].agent?.toLowerCase().includes('judge') ? '#F59E0B' : (AGENT_COLORS[(i % 4) + 1]), 
          strokeWidth: 2 
        },
        animated: !entries[i+1].content,
      })
    }

    setNodes([
      { id: 'problem', type: 'problem', data: { problem, agentCount, rounds }, position: { x: 400, y: 0 } }, 
      ...agentNodes
    ])
    setEdges(newEdges)
  }, [entries, problem, agentCount, rounds, setNodes, setEdges])

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  if (!isOpen) return null

  const formatTime = (ts) => {
    if (!ts) return ''
    const d = new Date(ts)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  const judgeCount = entries?.filter(e => e.agent?.toLowerCase().includes('judge') || e.agent?.toLowerCase().includes('evaluator') || e.agent?.toLowerCase().includes('synthesizer')).length || 0
  const participantCount = entries?.length - judgeCount || 0

  return (
    <div className="workflow-overlay" onClick={onClose}>
      <div className="workflow-container" onClick={e => e.stopPropagation()}>
        <div className="workflow-header">
          <h2>🧠 Agent Workflow</h2>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#94A3B8', background: '#1E293B', padding: '4px 10px', borderRadius: '12px' }}>
              👥 {participantCount} Participants
            </span>
            {judgeCount > 0 && (
              <span style={{ fontSize: '12px', color: '#F59E0B', background: 'rgba(245, 158, 11, 0.15)', padding: '4px 10px', borderRadius: '12px' }}>
                ⚖️ {judgeCount} Judge{judgeCount > 1 ? 's' : ''}
              </span>
            )}
            <span style={{ fontSize: '12px', color: '#64748B' }}>
              🔄 {rounds} rounds
            </span>
            <button className="close-workflow-btn" onClick={onClose}>×</button>
          </div>
        </div>
        <div className="workflow-graph">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            colorMode="dark"
            fitView
            minZoom={0.3}
            maxZoom={1.5}
            attributionPosition="bottom-left"
          >
            <Background color="#334155" gap={24} />
            <Controls showInteractive={false} />
            <MiniMap 
              nodeColor={(node) => {
                if (node.type === 'problem') return '#4F46E5'
                if (node.data?.role?.toLowerCase().includes('judge')) return '#F59E0B'
                return node.data?.agentColor || '#4F46E5'
              }}
              maskColor="rgba(15, 23, 42, 0.8)"
              style={{ background: '#1E293B' }}
            />
          </ReactFlow>
        </div>
      </div>
    </div>
  )
}