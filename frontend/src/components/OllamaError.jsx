export function OllamaError() {
  const copyCommand = () => {
    navigator.clipboard.writeText('ollama serve')
  }

  return (
    <div className="ollama-error">
      <div className="error-icon">⚠️</div>
      <h2>Ollama is not running</h2>
      <p>Start it with:</p>
      <div className="error-command">
        <code>ollama serve</code>
        <button className="copy-btn" onClick={copyCommand}>Copy</button>
      </div>
      <p className="error-hint">Then refresh this page.</p>
    </div>
  )
}