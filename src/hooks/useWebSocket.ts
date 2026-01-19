'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface WebSocketMessage {
  type: string
  timestamp?: string
  data?: any[]
  count?: number
  message?: string
}

interface UseWebSocketOptions {
  url?: string
  onMessage?: (data: WebSocketMessage) => void
  onOpen?: () => void
  onClose?: () => void
  onError?: (error: Event) => void
  enabled?: boolean
}

// Global WebSocket instance to prevent multiple connections
let globalWs: WebSocket | null = null
let globalConnectionCount = 0
let reconnectTimeout: NodeJS.Timeout | null = null

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    url = 'ws://161.97.73.254:8017/ws/market-overview',
    onMessage,
    onOpen,
    onClose,
    onError,
    enabled = true
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)

  const disconnect = useCallback(() => {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout)
      reconnectTimeout = null
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close()
      globalConnectionCount--
      setIsConnected(false)

      // Clean up global WebSocket if no more connections
      if (globalConnectionCount <= 0 && globalWs) {
        globalWs.close()
        globalWs = null
        console.log('🔌 Global WebSocket closed (no more connections)')
      }
    }
  }, [])

  const connect = useCallback(() => {
    if (!enabled) return

    // Reuse existing global WebSocket
    if (globalWs && globalWs.readyState === WebSocket.OPEN) {
      console.log('♻️ Using existing WebSocket connection')
      wsRef.current = globalWs
      globalConnectionCount++
      setIsConnected(true)
      onOpen?.()
      return
    }

    // Create new WebSocket connection
    if (globalWs) {
      console.log('🔄 Closing old connection before creating new one')
      globalWs.close()
    }

    console.log(`🔄 Connecting to WebSocket: ${url}`)

    try {
      const wsInstance = new WebSocket(url)
      globalWs = wsInstance
      wsRef.current = wsInstance
      globalConnectionCount++

      wsInstance.onopen = () => {
        console.log('✅ WebSocket connected to:', url)
        setIsConnected(true)
        onOpen?.()

        // Clear any pending reconnect
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout)
          reconnectTimeout = null
        }
      }

      wsInstance.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data)
          onMessage?.(data)
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error)
        }
      }

      wsInstance.onerror = (error) => {
        console.error('❌ WebSocket error:', error)
        onError?.(error)
        setIsConnected(false)
      }

      wsInstance.onclose = (event) => {
        console.log(`🔌 WebSocket closed: code=${event.code}, reason=${event.reason || 'No reason'}`)
        setIsConnected(false)
        globalConnectionCount--
        onClose?.()

        // Auto-reconnect if not intentional disconnect
        if (enabled && event.code !== 1000 && !reconnectTimeout) {
          console.log('⏰ Scheduling reconnection in 3 seconds...')
          reconnectTimeout = setTimeout(() => {
            reconnectTimeout = null
            if (enabled && !globalWs) {
              connect()
            }
          }, 3000)
        }
      }

    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error)
      onError?.(error as Event)
      setIsConnected(false)
    }
  }, [url, enabled, onOpen, onClose, onError, onMessage])

  useEffect(() => {
    if (enabled) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [enabled, connect, disconnect])

  return {
    isConnected,
    disconnect,
    reconnect: () => {
      disconnect()
      setTimeout(connect, 100)
    }
  }
}