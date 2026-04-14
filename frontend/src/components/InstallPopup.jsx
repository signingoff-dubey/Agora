import { useState } from 'react'

export function InstallPopup({ model, onClose }) {
  const [copied, setCopied] = useState(false)

  const copyCommand = () => {
    navigator.clipboard.writeText(`ollama pull ${model}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!model) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">Install {model}</h2>
        <p className="modal-text">Run this command in your terminal:</p>
        <div className="modal-command">
          <code>ollama pull {model}</code>
          <button className="copy-btn" onClick={copyCommand}>
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
        <p className="modal-hint">
          After installation, refresh the page to use this model as an agent.
        </p>
        <button className="close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}