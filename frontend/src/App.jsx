import { useState, useEffect, useCallback } from 'react'
import { useWebSocket } from './hooks/useWebSocket'
import { InstallPopup } from './components/InstallPopup'
import { WorkflowMap } from './components/WorkflowMap'
import './App.css'

const AGENT_COLORS = {
  1: '#06B6D4',
  2: '#8B5CF6',
  3: '#F59E0B',
  4: '#F43F5E',
  5: '#10B981',
}

function App() {
  const [models, setModels] = useState({ installed: [], available: [], ollama_running: true })
  const [agents, setAgents] = useState([
    { id: 1, model: '', role: 'Analyst' },
    { id: 2, model: '', role: 'Critic' },
    { id: 3, model: '', role: 'Specialist' },
  ])
  const [problem, setProblem] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [showWorkflow, setShowWorkflow] = useState(false)
  const [installPopup, setInstallPopup] = useState(null)
  const [apiKeyAgent, setApiKeyAgent] = useState(null)
  const [apiKeys, setApiKeys] = useState({})
  
  const { connected, entries, connect, send, disconnect } = useWebSocket(sessionId)

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/models')
      const data = await res.json()
      setModels(data)
      if (data.installed.length > 0) {
        setAgents(prev => prev.map((agent, idx) => ({
          ...agent,
          model: data.installed[idx % data.installed.length] || ''
        })))
      }
    } catch (err) {
      console.error('Failed to fetch models:', err)
    }
  }

  const handleModelChange = (agentId, model) => {
    if (models.available.includes(model) && !models.installed.includes(model)) {
      setInstallPopup(model)
      return
    }
    setAgents(prev => prev.map(a => 
      a.id === agentId ? { ...a, model } : a
    ))
  }

  const handleApiKeySubmit = (agentId, apiKey) => {
    setApiKeys(prev => ({ ...prev, [agentId]: apiKey }))
    setApiKeyAgent(null)
  }

  const addAgent = () => {
    if (agents.length < 5) {
      const newId = Math.max(...agents.map(a => a.id)) + 1
      setAgents(prev => [...prev, { 
        id: newId, 
        model: models.installed[0] || '', 
        role: 'Analyst' 
      }])
    }
  }

  const handleSubmit = async () => {
    if (!problem.trim() || isRunning) return
    
    const validAgents = agents.filter(a => a.model || apiKeys[a.id])
      .map(a => ({
        ...a,
        model: a.model || 'openai',
        apiKey: apiKeys[a.id] || null
      }))
    
    if (validAgents.length === 0) {
      alert('Please select at least one model for an agent')
      return
    }
    
    setIsRunning(true)
    
    try {
      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem, agents: validAgents })
      })
      const data = await res.json()
      setSessionId(data.session_id)
      connect(data.session_id)
      
      send({
        type: 'chat',
        problem: problem,
        agents: validAgents
      })
    } catch (err) {
      console.error('Chat error:', err)
      setIsRunning(false)
    }
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  return (
    <div className="app">
      <header className="header">
        <h1 className="logo">Agora</h1>
        <div className="agent-cards">
          {agents.map((agent, idx) => (
            <div key={agent.id} className="agent-card" style={{ borderTopColor: AGENT_COLORS[agent.id] || AGENT_COLORS[1] }}>
              <span className="agent-role">{agent.role}</span>
              <select 
                value={agent.model} 
                onChange={(e) => handleModelChange(agent.id, e.target.value)}
                className="model-select"
              >
                <option value="">Select model</option>
                {models.installed.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
                {models.available.map(m => (
                  <option key={m} value={m}>{m} (not installed)</option>
                ))}
                <option disabled>──</option>
                <option value="__API_KEY__" onClick={() => setApiKeyAgent(agent.id)}>
                  🔑 Enter API Key
                </option>
              </select>
              {apiKeyAgent === agent.id && (
                <input
                  type="password"
                  placeholder="sk-..."
                  className="api-key-input"
                  onBlur={(e) => handleApiKeySubmit(agent.id, e.target.value)}
                  autoFocus
                />
              )}
            </div>
          ))}
          {agents.length < 5 && (
            <button className="add-agent-btn" onClick={addAgent}>+</button>
          )}
        </div>
      </header>

      <main className="main">
        <div className="live-board">
          {entries.length === 0 && !isRunning && (
            <div className="empty-state">
              <p>Describe a problem, decision, or question...</p>
            </div>
          )}
          {entries.map((entry, idx) => (
            <div 
              key={entry.id} 
              className="entry-card" 
              style={{ borderLeftColor: AGENT_COLORS[entry.agentId] || AGENT_COLORS[1] }}
            >
              <div className="entry-header">
                <span className="entry-agent">{entry.agent} · {entry.model}</span>
                <span className="entry-time">{formatTime(entry.timestamp)}</span>
              </div>
              <div className="entry-content">
                {entry.content || (
                  <span className="thinking-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                )}
              </div>
              {entry.sentTo?.length > 0 && (
                <div className="entry-arrow">→ Sending to {entry.sentTo.join(', ')}</div>
              )}
              {entry.reactingTo && (
                <div className="entry-arrow">← Receiving from {entry.reactingTo}</div>
              )}
            </div>
          ))}
        </div>
      </main>

      <footer className="footer">
        <button className="workflow-btn" onClick={() => setShowWorkflow(!showWorkflow)}>
          Workflow
        </button>
        <input 
          type="text" 
          className="problem-input"
          placeholder="Describe a problem, decision, or question..."
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          disabled={isRunning}
        />
        <button 
          className="run-btn" 
          onClick={handleSubmit}
          disabled={isRunning || !problem.trim()}
        >
          {isRunning ? '⏳' : '▶'}
        </button>
      </footer>

      {installPopup && (
        <InstallPopup model={installPopup} onClose={() => setInstallPopup(null)} />
      )}
      
      <WorkflowMap 
        entries={entries} 
        isOpen={showWorkflow} 
        onClose={() => setShowWorkflow(false)} 
      />
    </div>
  )
}

export default App