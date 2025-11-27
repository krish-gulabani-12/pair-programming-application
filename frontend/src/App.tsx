/**
 * Main App component.
 * Renders either the room selector or the code editor based on room state.
 */

import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from './store/store'
import RoomSelector from './components/RoomSelector'
import CodeEditor from './components/CodeEditor'
import './App.css'

function App() {
  const roomId = useSelector((state: RootState) => state.room.roomId)

  return (
    <div className="App">
      {roomId ? <CodeEditor /> : <RoomSelector />}
    </div>
  )
}

export default App

