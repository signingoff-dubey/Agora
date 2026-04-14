import { useState, useEffect } from 'react'
import { useWebSocket } from './hooks/useWebSocket'
import { WorkflowMap } from './components/WorkflowMap'
import './App.css'

const ROLES = {
  Analyst: 'Breaks down problems',
  Critic: 'Questions assumptions',
  Specialist: 'Deep domain knowledge',
  Synthesizer: 'Combines insights',
  Explorer: 'Finds new angles',
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
  const [openRoleMenu, setOpenRoleMenu] = useState(null)
  
  const { connected, entries, connect, send } = useWebSocket(sessionId)

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/models')
      const data = await res.json()
      setModels(data)
      if (data.installed.length > 0 && agents[0].model === '') {
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
    setAgents(prev => prev.map(a => a.id === agentId ? { ...a, model } : a))
  }

  const handleRoleChange = (agentId, role) => {
    setAgents(prev => prev.map(a => a.id === agentId ? { ...a, role } : a))
    setOpenRoleMenu(null)
  }

  const handleApiKeySubmit = (agentId, apiKey) => {
    if (apiKey) setApiKeys(prev => ({ ...prev, [agentId]: apiKey }))
    setApiKeyAgent(null)
  }

  const addAgent = () => {
    if (agents.length < 5) {
      const usedRoles = agents.map(a => a.role)
      const newRole = Object.keys(ROLES).find(r => !usedRoles.includes(r)) || 'Analyst'
      setAgents(prev => [...prev, { id: Date.now(), model: models.installed[0] || '', role: newRole }])
    }
  }

  const removeAgent = (agentId) => {
    if (agents.length > 1) {
      setAgents(prev => prev.filter(a => a.id !== agentId))
    }
  }

  const handleSubmit = async () => {
    if (!problem.trim() || isRunning) return
    
    const validAgents = agents.filter(a => a.model || apiKeys[a.id])
      .map(a => ({ ...a, model: a.model || 'openai', apiKey: apiKeys[a.id] || null }))
    
    if (validAgents.length === 0) return
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
      send({ type: 'chat', problem, agents: validAgents })
    } catch (err) {
      console.error('Chat error:', err)
      setIsRunning(false)
    }
  }

  const formatTime = (ts) => ts ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''

  return (
    <div className="app">
      <section className="hero">
        <h1>Agora</h1>
        <p className="tagline">Where minds meet</p>
      </section>

      <div className="agents-row">
        {agents.map(agent => (
          <div key={agent.id} className="agent-card">
            <div className="agent-header">
              <button className="role-select" onClick={() => setOpenRoleMenu(openRoleMenu === agent.id ? null : agent.id)}>
                {agent.role} ▾
              </button>
              {agents.length > 1 && (
                <button className="remove-agent" onClick={() => removeAgent(agent.id)}>×</button>
              )}
            </div>
            
            {openRoleMenu === agent.id && (
              <div className="roles-dropdown">
                {Object.entries(ROLES).map(([role, desc]) => (
                  <div key={role} className="role-option" onClick={() => handleRoleChange(agent.id, role)}>
                    <strong>{role}</strong>
                    <span>{desc}</span>
                  </div>
                ))}
              </div>
            )}
            
            <select value={agent.model} onChange={(e) => handleModelChange(agent.id, e.target.value)} className="model-select">
              <option value="">Select model</option>
              {models.installed.map(m => <option key={m} value={m}>{m}</option>)}
              {models.available.map(m => <option key={m} value={m}>{m}</option>)}
              <option disabled>—</option>
              <option value="__API_KEY__">Use API Key</option>
            </select>
            
            {apiKeyAgent === agent.id && (
              <input type="password" placeholder="sk-..." className="api-input"
                onBlur={(e) => handleApiKeySubmit(agent.id, e.target.value)} autoFocus />
            )}
          </div>
        ))}
        
        {agents.length < 5 && (
          <button className="add-agent-btn" onClick={addAgent}>
            <span>+</span><small>Add</small>
          </button>
        )}
      </div>

      <div className="input-area">
        <input type="text" className="problem-input" placeholder="Ask something..."
          value={problem} onChange={(e) => setProblem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} disabled={isRunning} />
        <button className="run-btn" onClick={handleSubmit} disabled={isRunning || !problem.trim()}>
          {isRunning ? '●' : '▶'}
        </button>
      </div>

      <section className="board">
        <div className="board-inner">
          {entries.length === 0 && !isRunning && (
            <div className="empty-state">Ask a question to start</div>
          )}
          {entries.map(entry => (
            <div key={entry.id} className="entry">
              <div className="entry-header">
                <span className="entry-agent">{entry.agent}</span>
                <span className="entry-time">{formatTime(entry.timestamp)}</span>
              </div>
              <div className="entry-content">
                {entry.content || (
                  <div className="thinking"><span></span><span></span><span></span></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <button className="workflow-btn" onClick={() => setShowWorkflow(true)}>Workflow</button>

      <WorkflowMap entries={entries} isOpen={showWorkflow} onClose={() => setShowWorkflow(false)} />

      {installPopup && (
        <div className="modal-overlay" onClick={() => setInstallPopup(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Install {installPopup}</h2>
            <p>Run this command:</p>
            <code>ollama pull {installPopup}</code>
            <button className="copy-btn" onClick={() => navigator.clipboard.writeText(`ollama pull ${installPopup}`)}>Copy</button>
            <p className="hint">Refresh after installing.</p>
            <button className="close-btn" onClick={() => setInstallPopup(null)}>Close</button>
          </div>
        </div>
      )}

      <footer className="footer">Built with Ollama</footer>
    </div>
  )
}

export default App