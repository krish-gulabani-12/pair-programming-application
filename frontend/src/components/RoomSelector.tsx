import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../store/store'
import { createRoom, getRoom, setRoomId } from '../store/slices/roomSlice'
import './RoomSelector.css'

const RoomSelector = (): React.ReactElement | null => {
  const dispatch = useDispatch<AppDispatch>()
  const { roomId, isLoading, error } = useSelector((state: RootState) => state.room)
  const [joinRoomId, setJoinRoomId] = useState<string>('')

  const handleCreateRoom = async (): Promise<void> => {
    try {
      await dispatch(createRoom())
    } catch (err) {
      // Error handled by Redux
    }
  }

  const handleJoinRoom = async (): Promise<void> => {
    if (!joinRoomId.trim()) {
      alert('Please enter a room ID')
      return
    }

    try {
      const result = await dispatch(getRoom(joinRoomId.trim()))
      if (getRoom.fulfilled.match(result)) {
        dispatch(setRoomId(joinRoomId.trim()))
      } else {
        alert('Room not found. Please check the room ID.')
      }
    } catch (err) {
      alert('Room not found. Please check the room ID.')
    }
  }

  if (roomId) {
    return null
  }

  return (
    <div className="room-selector">
      <div className="room-selector-container">
        <h1>Pair Programming</h1>
        <p className="subtitle">Real-time collaborative code editing</p>

        <div className="room-actions">
          <div className="action-card">
            <h2>Create New Room</h2>
            <p>Start a new coding session</p>
            <button
              type="button"
              onClick={handleCreateRoom}
              disabled={isLoading}
              className="btn btn-primary"
              aria-label="Create new room"
            >
              {isLoading ? 'Creating...' : 'Create Room'}
            </button>
          </div>

          <div className="divider">OR</div>

          <div className="action-card">
            <h2>Join Existing Room</h2>
            <p>Enter a room ID to join</p>
            <div className="join-form">
              <input
                type="text"
                placeholder="Enter Room ID"
                value={joinRoomId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setJoinRoomId(e.target.value)
                }}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    handleJoinRoom()
                  }
                }}
                className="room-id-input"
                aria-label="Room ID input"
              />
              <button
                type="button"
                onClick={handleJoinRoom}
                disabled={isLoading || !joinRoomId.trim()}
                className="btn btn-secondary"
                aria-label="Join existing room"
              >
                {isLoading ? 'Joining...' : 'Join Room'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}

export default RoomSelector

