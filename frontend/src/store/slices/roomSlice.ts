/**
 * Redux slice for room management.
 * Handles room creation, joining, and room state.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

// API base URL - change this if your backend is on a different port
const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}`

// Types for room state
interface RoomState {
  roomId: string | null
  code: string
  language: string
  isLoading: boolean
  error: string | null
}

// Initial state
const initialState: RoomState = {
  roomId: null,
  code: '',
  language: 'python',
  isLoading: false,
  error: null,
}

// Async thunk to create a new room
export const createRoom = createAsyncThunk(
  'room/create',
  async () => {
    const response = await fetch(`${API_BASE_URL}/rooms/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error('Failed to create room')
    }
    
    const data = await response.json()
    return data.roomId // API returns { roomId: "..." }
  }
)

// Async thunk to get room information
export const getRoom = createAsyncThunk(
  'room/get',
  async (roomId: string) => {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error('Room not found')
    }
    
    const data = await response.json()
    return data
  }
)

// Room slice
const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    // Set room ID (when joining via URL)
    setRoomId: (state, action: PayloadAction<string>) => {
      state.roomId = action.payload
    },
    // Clear room (when leaving)
    clearRoom: (state) => {
      state.roomId = null
      state.code = ''
      state.error = null
    },
    // Update code locally (before syncing via WebSocket)
    updateCodeLocal: (state, action: PayloadAction<string>) => {
      state.code = action.payload
    },
    // Update language
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload
    },
  },
  extraReducers: (builder) => {
    // Handle createRoom async actions
    builder
      .addCase(createRoom.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.isLoading = false
        state.roomId = action.payload
        state.error = null
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to create room'
      })
    
    // Handle getRoom async actions
    builder
      .addCase(getRoom.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getRoom.fulfilled, (state, action) => {
        state.isLoading = false
        state.roomId = action.payload.room_id
        state.code = action.payload.code
        state.language = action.payload.language
        state.error = null
      })
      .addCase(getRoom.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to get room'
      })
  },
})

// Export actions
export const { setRoomId, clearRoom, updateCodeLocal, setLanguage } = roomSlice.actions

// Export reducer
export default roomSlice.reducer

