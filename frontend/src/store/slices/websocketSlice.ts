/**
 * Redux slice for WebSocket connection management.
 * Handles WebSocket connection state and real-time updates.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// Types for WebSocket state
interface WebSocketState {
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  lastUpdate: number | null
}

// Initial state
const initialState: WebSocketState = {
  isConnected: false,
  isConnecting: false,
  error: null,
  lastUpdate: null,
}

// WebSocket slice
const websocketSlice = createSlice({
  name: 'websocket',
  initialState,
  reducers: {
    // Set connecting state
    setConnecting: (state, action: PayloadAction<boolean>) => {
      state.isConnecting = action.payload
    },
    // Set connected state
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload
      if (action.payload) {
        state.isConnecting = false
        state.error = null
      }
    },
    // Set error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      if (action.payload) {
        state.isConnected = false
        state.isConnecting = false
      }
    },
    // Update last update timestamp
    setLastUpdate: (state, action: PayloadAction<number>) => {
      state.lastUpdate = action.payload
    },
    // Reset WebSocket state
    reset: (state) => {
      state.isConnected = false
      state.isConnecting = false
      state.error = null
      state.lastUpdate = null
    },
  },
})

// Export actions
export const { setConnecting, setConnected, setError, setLastUpdate, reset } = websocketSlice.actions

// Export reducer
export default websocketSlice.reducer

