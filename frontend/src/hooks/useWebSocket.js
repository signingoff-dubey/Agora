import { useEffect, useRef, useState, useCallback } from 'react'

export function useWebSocket(sessionId) {
  const [connected, setConnected] = useState(false)
  const [entries, setEntries] = useState([])
  const wsRef = useRef(null)

  const connect = useCallback((sid) => {
    if (!sid) return
    
    const ws = new WebSocket(`ws://localhost:8000/ws/${sid}`)
    
    ws.onopen = () => {
      setConnected(true)
      console.log('WebSocket connected')
    }
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        
        switch (message.type) {
          case 'connected':
            console.log('Session connected:', message.session_id)
            break
          
          case 'entry':
            setEntries(prev => {
              const existing = prev.findIndex(e => e.id === message.entry.id)
              if (existing >= 0) {
                const updated = [...prev]
                updated[existing] = message.entry
                return updated
              }
              return [...prev, message.entry]
            })
            break
          
          case 'problem':
            setEntries([])
            break
          
          case 'done':
            console.log('Session complete')
            break
          
          default:
            console.log('Unknown message:', message)
        }
      } catch (e) {
        console.error('Failed to parse message:', e)
      }
    }
    
    ws.onclose = () => {
      setConnected(false)
      console.log('WebSocket disconnected')
    }
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
    
    wsRef.current = ws
  }, [])

  const send = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    }
  }, [])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return { connected, entries, connect, send, disconnect }
}