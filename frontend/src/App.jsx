import { useState, useEffect } from 'react'
import { useWebSocket } from './hooks/useWebSocket'
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
  ])
  const [problem, setProblem] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [showWorkflow, setShowWorkflow] = useState(false)
  const [installPopup, setInstallPopup] = useState(null)
  const [apiKeyAgent, setApiKeyAgent] = useState(null)
  const [apiKeys, setApiKeys] = useState({})
  
  const { connected, entries, connect, send } = useWebSocket(sessionId)

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
    if (apiKey) {
      setApiKeys(prev => ({ ...prev, [agentId]: apiKey }))
    }
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
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="app">
      <section className="hero">
        <h1>Agora</h1>
        <p>Where minds meet. Describe a problem and watch multiple AI agents reason together.</p>
        
        <div className="agent-row">
          {agents.map(agent => (
            <div key={agent.id} className="agent-pill">
              <span>{agent.role}</span>
              <select 
                value={agent.model} 
                onChange={(e) => handleModelChange(agent.id, e.target.value)}
              >
                <option value="">Select</option>
                {models.installed.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
                {models.available.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
                <option disabled>—</option>
                <option value="__API_KEY__">API Key</option>
              </select>
              {apiKeyAgent === agent.id && (
                <input
                  type="password"
                  placeholder="sk-..."
                  className="api-input"
                  onBlur={(e) => handleApiKeySubmit(agent.id, e.target.value)}
                  autoFocus
                />
              )}
            </div>
          ))}
          {agents.length < 5 && (
            <button className="add-agent" onClick={addAgent}>+</button>
          )}
        </div>
        
        <div className="input-area">
          <input 
            type="text" 
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
            {isRunning ? '●' : '▶'}
          </button>
        </div>
      </section>

      <section className="board">
        {entries.map(entry => (
          <div 
            key={entry.id} 
            className="entry"
            style={{ borderLeft: `3px solid ${AGENT_COLORS[entry.agentId] || AGENT_COLORS[1]}` }}
          >
            <div className="entry-header">
              <span className="entry-agent">{entry.agent}</span>
              <span className="entry-time">{formatTime(entry.timestamp)}</span>
            </div>
            <div className="entry-content">
              {entry.content || (
                <div className="thinking">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              )}
            </div>
            {entry.sentTo?.length > 0 && (
              <div className="entry-arrow">→ {entry.sentTo.join(', ')}</div>
            )}
          </div>
        ))}
      </section>

      <button className="workflow-toggle" onClick={() => setShowWorkflow(true)}>
        Workflow
      </button>

      <WorkflowMap 
        entries={entries} 
        isOpen={showWorkflow} 
        onClose={() => setShowWorkflow(false)} 
      />

      {installPopup && (
        <div className="modal-overlay" onClick={() => setInstallPopup(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Install {installPopup}</h2>
            <p>Run this command:</p>
            <code>ollama pull {installPopup}</code>
            <button className="copy-btn" onClick={() => navigator.clipboard.writeText(`ollama pull ${installPopup}`)}>
              Copy
            </button>
            <p className="hint">Refresh after installing.</p>
            <button className="close-btn" onClick={() => setInstallPopup(null)}>Close</button>
          </div>
        </div>
      )}

      <div className="footer">
        Built with Ollama · localhost
      </div>
    </div>
  )
}

export default App