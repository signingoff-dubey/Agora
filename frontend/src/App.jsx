import { useState, useEffect } from 'react'
import { useWebSocket } from './hooks/useWebSocket'
import { WorkflowMap } from './components/WorkflowMap'
import './App.css'

const AGENT_COLORS = {
  Analyst: '#06B6D4',
  Critic: '#8B5CF6',
  Specialist: '#F59E0B',
  Synthesizer: '#10B981',
  Explorer: '#F43F5E',
}

const ROLES = {
  Analyst: 'Breaks down problems into components and identifies key patterns.',
  Critic: 'Questions assumptions, finds flaws, and challenges conclusions.',
  Specialist: 'Applies deep domain knowledge to solve specific aspects.',
  Synthesizer: 'Combines insights from all agents into a coherent answer.',
  Explorer: 'Finds novel connections and alternative perspectives.',
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
  const [showRolesHelp, setShowRolesHelp] = useState(false)
  
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
    setAgents(prev => prev.map(a => 
      a.id === agentId ? { ...a, model } : a
    ))
  }

  const handleRoleChange = (agentId, role) => {
    setAgents(prev => prev.map(a => 
      a.id === agentId ? { ...a, role } : a
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
      const newId = Date.now()
      const usedRoles = agents.map(a => a.role)
      const availableRoles = Object.keys(ROLES).filter(r => !usedRoles.includes(r))
      const newRole = availableRoles[0] || 'Analyst'
      setAgents(prev => [...prev, { 
        id: newId, 
        model: models.installed[0] || '', 
        role: newRole 
      }])
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
      .map(a => ({
        ...a,
        model: a.model || 'openai',
        apiKey: apiKeys[a.id] || null
      }))
    
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
        <p className="tagline">Where minds meet</p>
        
        <div className="agents-container">
          {agents.map(agent => (
            <div key={agent.id} className="agent-card" style={{ borderColor: AGENT_COLORS[agent.role] }}>
              <div className="agent-header">
                <button 
                  className="role-select"
                  onClick={() => setShowRolesHelp(!showRolesHelp)}
                  title="Click to learn about roles"
                >
                  {agent.role}
                  <span className="role-arrow">▾</span>
                </button>
                {agents.length > 1 && (
                  <button 
                    className="remove-agent"
                    onClick={() => removeAgent(agent.id)}
                    title="Remove agent"
                  >
                    ×
                  </button>
                )}
              </div>
              
              {showRolesHelp && (
                <div className="roles-help">
                  {Object.entries(ROLES).map(([role, desc]) => (
                    <div 
                      key={role} 
                      className="role-help-item"
                      onClick={() => {
                        handleRoleChange(agent.id, role)
                        setShowRolesHelp(false)
                      }}
                    >
                      <strong>{role}</strong>
                      <span>{desc}</span>
                    </div>
                  ))}
                </div>
              )}
              
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
                <option disabled>—</option>
                <option value="__API_KEY__">Use API Key →</option>
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
            <button className="add-agent-btn" onClick={addAgent}>
              <span>+</span>
              <span className="add-label">Add Agent</span>
            </button>
          )}
        </div>
        
        <div className="input-container">
          <input 
            type="text" 
            className="problem-input"
            placeholder="Describe your problem..."
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
        {entries.length === 0 && !isRunning && (
          <div className="empty-state">
            <p>Ask a question to start the conversation</p>
          </div>
        )}
        
        {entries.map((entry, idx) => (
          <div 
            key={entry.id} 
            className="entry"
            style={{ borderLeftColor: AGENT_COLORS[entry.agent?.split(' ')[1]] || AGENT_COLORS.Analyst }}
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

      <button className="workflow-btn" onClick={() => setShowWorkflow(true)}>
        View Workflow
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
            <p className="modal-text">Run this command in your terminal:</p>
            <div className="modal-command">
              <code>ollama pull {installPopup}</code>
              <button 
                className="copy-btn"
                onClick={() => navigator.clipboard.writeText(`ollama pull ${installPopup}`)}
              >
                Copy
              </button>
            </div>
            <p className="modal-hint">Refresh the page after installing.</p>
            <button className="modal-close" onClick={() => setInstallPopup(null)}>Close</button>
          </div>
        </div>
      )}

      <footer className="footer">
        Built with Ollama
      </footer>
    </div>
  )
}

export default App