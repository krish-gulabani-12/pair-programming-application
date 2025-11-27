/**
 * Redux store configuration.
 * This file sets up the Redux store with all our slices.
 */

import { configureStore } from '@reduxjs/toolkit'
import roomReducer from './slices/roomSlice'
import editorReducer from './slices/editorSlice'
import websocketReducer from './slices/websocketSlice'

// Configure the Redux store
// This combines all our reducers (room, editor, websocket)
export const store = configureStore({
  reducer: {
    room: roomReducer,
    editor: editorReducer,
    websocket: websocketReducer,
  },
})

// TypeScript types for the store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

