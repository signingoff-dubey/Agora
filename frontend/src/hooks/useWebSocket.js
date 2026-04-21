import { useEffect, useRef, useState, useCallback } from 'react'

export function useWebSocket({ onDone, onError } = {}) {
  const [connected, setConnected] = useState(false)
  const [entries, setEntries] = useState([])
  const wsRef = useRef(null)
  const callbacksRef = useRef({ onDone, onError })
  const pendingMessageRef = useRef(null)

  // Keep callbacks fresh without re-creating connect
  useEffect(() => {
    callbacksRef.current = { onDone, onError }
  }, [onDone, onError])

  const connect = useCallback((sid, messageToSend) => {
    if (!sid) return

    if (wsRef.current) {
      wsRef.current.close()
    }

    // Store message to send once connected
    if (messageToSend) {
      pendingMessageRef.current = messageToSend
    }

    const ws = new WebSocket(`ws://localhost:8000/ws/${sid}`)

    ws.onopen = () => {
      setConnected(true)
      console.log('[WS] Connected to', sid)

      // Send pending message immediately on open
      if (pendingMessageRef.current) {
        console.log('[WS] Sending pending message:', pendingMessageRef.current.type)
        ws.send(JSON.stringify(pendingMessageRef.current))
        pendingMessageRef.current = null
      }
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        console.log('[WS] Received:', message.type)

        switch (message.type) {
          case 'connected':
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
            console.log('[WS] Session complete')
            callbacksRef.current.onDone?.()
            break

          case 'error':
            console.error('[WS] Error:', message.message)
            callbacksRef.current.onError?.(message.message || 'Unknown error')
            break

          default:
            console.log('[WS] Unknown message:', message)
        }
      } catch (e) {
        console.error('[WS] Failed to parse message:', e)
      }
    }

    ws.onclose = () => {
      setConnected(false)
      console.log('[WS] Disconnected')
    }

    ws.onerror = (error) => {
      console.error('[WS] Connection error:', error)
      callbacksRef.current.onError?.('WebSocket connection failed')
    }

    wsRef.current = ws
  }, [])

  const send = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('[WS] Sending:', message.type)
      wsRef.current.send(JSON.stringify(message))
    } else {
      console.warn('[WS] Not connected, queuing message')
      pendingMessageRef.current = message
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
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [])

  return { connected, entries, connect, send, disconnect }
}