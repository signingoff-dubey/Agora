import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
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

const AGENT_COLORS = ['#06B6D4', '#8B5CF6', '#F59E0B', '#F43F5E', '#10B981']

function App() {
  const [models, setModels] = useState({ installed: [], available: [], ollama_running: true })
  const [agents, setAgents] = useState([
    { id: 1, model: '', role: 'Auto' },
    { id: 2, model: '', role: 'Auto' },
    { id: 3, model: '', role: 'Judge' }
  ])
  const [nextAgentId, setNextAgentId] = useState(4)
  const [problem, setProblem] = useState('Research how to build a scalable multi-agent AI system')
  const [sessionId, setSessionId] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [showWorkflow, setShowWorkflow] = useState(false)
  const [installPopup, setInstallPopup] = useState(null)
  const [apiKeyAgent, setApiKeyAgent] = useState(null)
  const [apiKeys, setApiKeys] = useState({})
  const [error, setError] = useState(null)
  const [ollamaDown, setOllamaDown] = useState(false)
  const [numRounds, setNumRounds] = useState(3)
  const [isPlanning, setIsPlanning] = useState(false)
  const [planPreview, setPlanPreview] = useState(null)
  const [theme, setTheme] = useState('dark')
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const { connected, entries, connect, send } = useWebSocket({
    onDone: () => setIsRunning(false),
    onError: (msg) => {
      setError(msg)
      setIsRunning(false)
    },
  })

  // Fetch models on load
  useEffect(() => {
    const loadModels = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/models')
        if (!res.ok) throw new Error('Backend not reachable')
        const data = await res.json()
        setModels(data)
        setOllamaDown(!data.ollama_running)

        // Auto-assign first installed models to agents
        if (data.installed.length > 0 && agents[0].model === '') {
          setAgents(prev => prev.map((agent, idx) => ({
            ...agent,
            model: data.installed[idx % data.installed.length] || ''
          })))
        }
      } catch (err) {
        console.error('Failed to fetch models:', err)
        setError('Cannot connect to backend. Is it running on port 8000?')
      }
    }
    loadModels()
  }, [])

  const handleModelChange = (agentId, model) => {
    if (model === '__API_KEY__') {
      setApiKeyAgent(agentId)
      return
    }
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
      setAgents(prev => [...prev, { id: nextAgentId, model: models.installed[0] || '', role: 'Auto' }])
      setNextAgentId(prev => prev + 1)
    }
  }

  const removeAgent = (agentId) => {
    if (agents.length > 1) {
      setAgents(prev => prev.filter(a => a.id !== agentId))
    }
  }

  const handleSubmit = async () => {
    if (!problem.trim() || isRunning) return
    setError(null)

    const validAgents = agents.filter(a => a.model || apiKeys[a.id])
      .map(a => ({ ...a, model: a.model || 'openai', apiKey: apiKeys[a.id] || null }))

    if (validAgents.length === 0) {
      setError('Select a model for at least one agent')
      return
    }
    setIsPlanning(true)

    try {
      const res = await fetch('http://localhost:8000/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem, agents: validAgents })
      })
      if (!res.ok) {
        const errData = await res.json()
        setError(errData.error || 'Request failed')
        setIsPlanning(false)
        return
      }
      const data = await res.json()
      
      // Merge models and existing IDs back into the returned plan
      const assignedAgents = validAgents.map((ag, i) => {
        const plannedParams = data.agents && data.agents[i] ? data.agents[i] : {}
        return {
          ...ag,
          role: plannedParams.role || ag.role,
          stance: plannedParams.stance || ''
        }
      })
      
      setPlanPreview(assignedAgents)
      setIsPlanning(false)
    } catch (err) {
      console.error('Plan error:', err)
      setError(err.message || 'Failed to connect to backend for planning')
      setIsPlanning(false)
    }
  }

  const handleConfirmStart = async () => {
    setIsRunning(true)
    setPlanPreview(null)
    
    try {
      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem, agents: planPreview })
      })
      if (!res.ok) {
        const errData = await res.json()
        setError(errData.error || 'Request failed')
        setIsRunning(false)
        return
      }
      const data = await res.json()
      setSessionId(data.session_id)
      connect(data.session_id, { type: 'chat', problem, agents: planPreview, numRounds })
    } catch (err) {
      console.error('Chat error:', err)
      setError(err.message || 'Failed to connect to backend')
      setIsRunning(false)
    }
  }

  const handleCopyCommand = (cmd) => {
    navigator.clipboard.writeText(cmd)
  }

  const formatTime = (ts) => ts ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''

  // Ollama not running — show error screen
  if (ollamaDown && models.installed.length === 0) {
    return (
      <div className="app">
        <section className="hero">
          <h1>Agora</h1>
          <p className="tagline">Where minds meet</p>
        </section>

        <div className="ollama-error">
          <div className="error-icon">⚠️</div>
          <h2>Ollama is not running</h2>
          <p>Start it with:</p>
          <div className="error-command">
            <code>ollama serve</code>
            <button className="copy-btn" onClick={() => handleCopyCommand('ollama serve')}>Copy</button>
          </div>
          <p className="error-hint">Then refresh this page.</p>
        </div>

        <footer className="footer">Built with Ollama</footer>
      </div>
    )
  }

  return (
    <div className="app">
      <section className="hero">
        <h1>Agora</h1>
        <p className="tagline">Where minds meet</p>
      </section>

      <div className="agents-row">
        {agents.map((agent, idx) => (
          <div key={agent.id} className="agent-card" style={{ '--agent-color': AGENT_COLORS[idx] || AGENT_COLORS[0] }}>
            <div className="agent-header">
              <div className="role-select-wrapper">
                <input 
                  className="role-input" 
                  value={agent.role}
                  onChange={(e) => handleRoleChange(agent.id, e.target.value)}
                  list={`roles-${agent.id}`}
                  placeholder="Enter role..."
                />
                <datalist id={`roles-${agent.id}`}>
                  {Object.keys(ROLES).map((role) => (
                    <option key={role} value={role} />
                  ))}
                  <option value="FOR Figma" />
                  <option value="AGAINST Figma" />
                </datalist>
              </div>
              {agents.length > 1 && (
                <button className="remove-agent" onClick={() => removeAgent(agent.id)}>×</button>
              )}
            </div>

            <select value={agent.model} onChange={(e) => handleModelChange(agent.id, e.target.value)} className="model-select">
              <option value="">Select model</option>
              {models.installed.length > 0 && (
                <optgroup label="Installed">
                  {models.installed.map(m => <option key={m} value={m}>● {m}</option>)}
                </optgroup>
              )}
              {models.available.length > 0 && (
                <optgroup label="Available (not installed)">
                  {models.available.map(m => <option key={m} value={m}>○ {m}</option>)}
                </optgroup>
              )}
              <option disabled>—</option>
              <option value="__API_KEY__">🔑 Use API Key</option>
            </select>

            {apiKeyAgent === agent.id && (
              <input type="password" placeholder="sk-..." className="api-input"
                onBlur={(e) => handleApiKeySubmit(agent.id, e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApiKeySubmit(agent.id, e.target.value)}
                autoFocus />
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
        <div className="settings-panel">
          <label className="rounds-label">
            Rounds: {numRounds}
            <input 
              type="range" 
              className="rounds-slider" 
              min="1" 
              max="5" 
              value={numRounds} 
              onChange={(e) => setNumRounds(e.target.value)}
              disabled={isRunning || isPlanning}
            />
          </label>
        </div>

        <input type="text" className="problem-input" placeholder="Describe a problem, decision, or question..."
          value={problem} onChange={(e) => setProblem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} disabled={isRunning || isPlanning} />
        <button className="run-btn" onClick={handleSubmit} disabled={isRunning || isPlanning || !problem.trim()}>
          {isPlanning ? <span className="spinner"></span> : (isRunning ? '▶' : 'Plan ▹')}
        </button>
      </div>

      {planPreview && (
        <div className="modal-overlay">
          <div className="plan-modal">
            <h2>Session Plan Preview</h2>
            <p className="plan-desc">Agora has structured the debate based on your prompt.</p>
            
            <div className="plan-cards">
              {planPreview.map(ag => (
                <div key={ag.id} className="plan-card">
                  <strong>Agent {ag.id} [{ag.role}]</strong>
                  <p>{ag.stance}</p>
                </div>
              ))}
            </div>
            
            <div className="plan-actions">
              <button className="cancel-plan-btn" onClick={() => setPlanPreview(null)}>Cancel</button>
              <button className="confirm-plan-btn" onClick={handleConfirmStart}>Confirm & Start</button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button className="error-dismiss" onClick={() => setError(null)}>×</button>
        </div>
      )}

      <section className="board">
        <div className="board-inner">
          {entries.length === 0 && !isRunning && (
            <div className="empty-state">Ask a question to start</div>
          )}
          {entries.map(entry => (
            <div key={entry.id} className="entry" style={{ borderLeftColor: AGENT_COLORS[parseInt(entry.agentId) - 1] || AGENT_COLORS[0] }}>
              <div className="entry-header">
                <span className="entry-agent">
                  <span className="agent-dot" style={{ background: AGENT_COLORS[parseInt(entry.agentId) - 1] || AGENT_COLORS[0] }}></span>
                  {entry.agent} · {entry.model}
                </span>
                <span className="entry-time">{formatTime(entry.timestamp)}</span>
              </div>
              <div className="entry-content">
                {entry.content ? (
                  <ReactMarkdown>{entry.content}</ReactMarkdown>
                ) : (
                  <div className="thinking"><span></span><span></span><span></span></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <button className="workflow-btn" onClick={() => setShowWorkflow(true)}>Workflow</button>

      <button className="settings-btn" onClick={() => setShowSettings(true)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
        Settings
      </button>

      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="settings-modal" onClick={e => e.stopPropagation()}>
            <h2>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              Settings
            </h2>
            
            <div className="settings-section">
              <h3>Theme</h3>
              <div className="theme-options">
                <div className={`theme-option dark ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}>
                  <div className="theme-preview"></div>
                  <span>Dark</span>
                </div>
                <div className={`theme-option light ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}>
                  <div className="theme-preview"></div>
                  <span>Light</span>
                </div>
                <div className={`theme-option neomorphism ${theme === 'neomorphism' ? 'active' : ''}`} onClick={() => setTheme('neomorphism')}>
                  <div className="theme-preview"></div>
                  <span>Neomorphism Dark</span>
                </div>
                <div className={`theme-option neomorphism-light ${theme === 'neomorphism-light' ? 'active' : ''}`} onClick={() => setTheme('neomorphism-light')}>
                  <div className="theme-preview"></div>
                  <span>Neomorphism Light</span>
                </div>
                <div className={`theme-option glassmorphism ${theme === 'glassmorphism' ? 'active' : ''}`} onClick={() => setTheme('glassmorphism')}>
                  <div className="theme-preview"></div>
                  <span>Glassmorphism</span>
                </div>
              </div>
            </div>

            <button className="settings-close-btn" onClick={() => setShowSettings(false)}>Done</button>
          </div>
        </div>
      )}

      <WorkflowMap entries={entries} isOpen={showWorkflow} onClose={() => setShowWorkflow(false)} />

      {installPopup && (
        <div className="modal-overlay" onClick={() => setInstallPopup(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Install {installPopup}</h2>
            <p>Run this command in your terminal:</p>
            <div className="modal-command">
              <code>ollama pull {installPopup}</code>
              <button className="copy-btn" onClick={() => handleCopyCommand(`ollama pull ${installPopup}`)}>Copy</button>
            </div>
            <p className="hint">After installation, refresh the page to use this model.</p>
            <button className="close-btn" onClick={() => setInstallPopup(null)}>Close</button>
          </div>
        </div>
      )}

      <footer className="footer">Built with Ollama</footer>
    </div>
  )
}

export default App