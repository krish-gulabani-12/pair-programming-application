/**
 * Custom hook for managing WebSocket connection.
 * Handles connecting, sending, and receiving messages.
 */

import React, { useEffect, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../store/store'
import { setConnected, setConnecting, setError, setLastUpdate } from '../store/slices/websocketSlice'
import { setCode, setLanguage, setCursorPosition } from '../store/slices/editorSlice'
import { updateCodeLocal, setLanguage as setRoomLanguage } from '../store/slices/roomSlice'

// WebSocket base URL
const WS_BASE_URL = `ws://${import.meta.env.VITE_BACKEND_URL}:8000`

/**
 * Hook to manage WebSocket connection for a room
 * @param roomId - The room ID to connect to
 * @param onMessage - Optional callback for received messages
 */
export const useWebSocket = (roomId: string | null, onMessage?: (data: unknown) => void) => {
  const dispatch = useDispatch<AppDispatch>()
  const wsRef = useRef<WebSocket | null>(null)
  const roomIdRef = useRef<string | null>(null)
  
  // Get current state
  const isConnected = useSelector((state: RootState) => state.websocket.isConnected)
  const code = useSelector((state: RootState) => state.editor.code)

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!roomId) {
      return
    }

    // Don't reconnect if already connected to the same room
    if (wsRef.current && roomIdRef.current === roomId && isConnected) {
      return
    }

    // Close existing connection if room changed
    if (wsRef.current && roomIdRef.current !== roomId) {
      wsRef.current.close()
      wsRef.current = null
    }

    // Don't connect if already connecting
    if (wsRef.current?.readyState === WebSocket.CONNECTING) {
      return
    }

    dispatch(setConnecting(true))
    dispatch(setError(null))

    try {
      const ws = new WebSocket(`${WS_BASE_URL}/ws/${roomId}`)
      wsRef.current = ws
      roomIdRef.current = roomId

      // Connection opened
      ws.onopen = () => {
        dispatch(setConnected(true))
        dispatch(setConnecting(false))
        dispatch(setError(null))
      }

      // Message received
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.type === 'initial_code') {
            // Initial code when joining room
            dispatch(setCode(data.code))
            dispatch(updateCodeLocal(data.code))
            // Update cursor position to end of code when receiving initial code
            dispatch(setCursorPosition(data.code.length))
            if (data.language) {
              dispatch(setLanguage(data.language))
              dispatch(setRoomLanguage(data.language))
            }
          } else if (data.type === 'code_update') {
            // Code update from another user
            // Preserve cursor position if possible, otherwise set to end
            const currentCode = code
            const newCode = data.code
            let newCursorPos = 0
            
            // If code was appended, try to maintain relative cursor position
            if (newCode.startsWith(currentCode)) {
              // Code was appended, keep cursor at same position
              newCursorPos = Math.min(code.length, newCode.length)
            } else {
              // Code changed significantly, set cursor to end
              newCursorPos = newCode.length
            }
            
            dispatch(setCode(newCode))
            dispatch(updateCodeLocal(newCode))
            dispatch(setCursorPosition(newCursorPos))
            if (data.language) {
              dispatch(setLanguage(data.language))
              dispatch(setRoomLanguage(data.language))
            }
            dispatch(setLastUpdate(Date.now()))
          }

          // Call custom message handler if provided
          if (onMessage) {
            onMessage(data)
          }
        } catch (error) {
          // Ignore parsing errors
        }
      }

      ws.onerror = () => {
        dispatch(setError('WebSocket connection error'))
        dispatch(setConnected(false))
        dispatch(setConnecting(false))
      }

      ws.onclose = () => {
        dispatch(setConnected(false))
        dispatch(setConnecting(false))
        wsRef.current = null
      }
    } catch (error) {
      dispatch(setError('Failed to create WebSocket connection'))
      dispatch(setConnecting(false))
    }
  }, [roomId, dispatch, isConnected])

  // Send code update to server
  const sendCodeUpdate = useCallback((code: string, language: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        code,
        language,
      }))
    }
  }, [])

  // Disconnect
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
      roomIdRef.current = null
      dispatch(setConnected(false))
      dispatch(setConnecting(false))
    }
  }, [dispatch])

  // Connect when roomId changes
  useEffect(() => {
    if (roomId) {
      connect()
    } else {
      disconnect()
    }

    // Cleanup on unmount
    return () => {
      disconnect()
    }
  }, [roomId, connect, disconnect])

  return {
    isConnected,
    sendCodeUpdate,
    disconnect,
  }
}

