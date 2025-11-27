import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../store/store'
import { setCode, setCursorPosition, setLanguage as setEditorLanguage, clearAutocomplete } from '../store/slices/editorSlice'
import { clearRoom, setLanguage as setRoomLanguage } from '../store/slices/roomSlice'
import { useWebSocket } from '../hooks/useWebSocket'
import { useAutocomplete } from '../hooks/useAutocomplete'
import AutocompletePopup from './AutocompletePopup'
import './CodeEditor.css'

const CodeEditor = () => {
  const dispatch = useDispatch<AppDispatch>()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [localCode, setLocalCode] = useState('')
  const [isPointerActive, setIsPointerActive] = useState(false)

  const roomId = useSelector((state: RootState) => state.room.roomId)
  const code = useSelector((state: RootState) => state.editor.code)
  const language = useSelector((state: RootState) => state.editor.language)
  const cursorPosition = useSelector((state: RootState) => state.editor.cursorPosition)
  const autocompleteSuggestion = useSelector((state: RootState) => state.editor.autocompleteSuggestion)
  const autocompleteError = useSelector((state: RootState) => state.editor.autocompleteError)
  const isAutocompleteLoading = useSelector((state: RootState) => state.editor.isAutocompleteLoading)
  const isConnected = useSelector((state: RootState) => state.websocket.isConnected)
  const isConnecting = useSelector((state: RootState) => state.websocket.isConnecting)

  const { sendCodeUpdate } = useWebSocket(roomId)
  useAutocomplete(isPointerActive)

  useEffect(() => {
    setLocalCode(code)
  }, [code])

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isPointerActive) {
      setIsPointerActive(true)
    }
    const newCode = e.target.value
    setLocalCode(newCode)
    const cursorPos = e.target.selectionStart
    dispatch(setCursorPosition(cursorPos))
    dispatch(setCode(newCode))
    if (isConnected && roomId) {
      sendCodeUpdate(newCode, language)
    }
  }

  const handleCursorChange = () => {
    if (textareaRef.current) {
      if (!isPointerActive) {
        setIsPointerActive(true)
      }
      const cursorPos = textareaRef.current.selectionStart
      dispatch(setCursorPosition(cursorPos))
    }
  }

  const applyAutocomplete = () => {
    if (!autocompleteSuggestion || !textareaRef.current) {
      return
    }

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const newCode = 
      localCode.substring(0, start) + 
      autocompleteSuggestion + 
      localCode.substring(start)
    
    setLocalCode(newCode)
    const newCursorPos = start + autocompleteSuggestion.length
    dispatch(setCode(newCode))
    dispatch(setCursorPosition(newCursorPos))
    
    if (isConnected && roomId) {
      sendCodeUpdate(newCode, language)
    }

    setTimeout(() => {
      if (textarea) {
        textarea.selectionStart = textarea.selectionEnd = newCursorPos
        textarea.focus()
      }
    }, 0)
  }

  const handleLeaveRoom = () => {
    if (window.confirm('Are you sure you want to leave this room?')) {
      dispatch(clearRoom())
      setLocalCode('')
    }
  }

  const copyRoomId = async () => {
    if (!roomId) {
      return
    }

    const text = roomId

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()
        const successful = document.execCommand('copy')
        document.body.removeChild(textarea)
        if (!successful) {
          throw new Error('Fallback copy command failed')
        }
      }

      alert('Room ID copied to clipboard!')
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy room ID:', err)
      alert('Unable to copy Room ID. Please copy it manually.')
    }
  }

  if (!roomId) {
    return null
  }

  return (
    <div className="code-editor-container">
      {/* Header */}
      <div className="editor-header">
        <div className="header-left">
          <h2>Room: {roomId.substring(0, 8)}...</h2>
          <div className="connection-status">
            {isConnecting && <span className="status connecting">Connecting...</span>}
            {isConnected && <span className="status connected">● Connected</span>}
            {!isConnected && !isConnecting && <span className="status disconnected">● Disconnected</span>}
          </div>
        </div>
        <div className="header-right">
          <button onClick={copyRoomId} className="btn btn-small">
            Copy Room ID
          </button>
          <button onClick={handleLeaveRoom} className="btn btn-small btn-danger">
            Leave Room
          </button>
        </div>
      </div>

      {/* Language selector */}
      <div className="language-selector">
        <label>Language: </label>
        <select
          value={language}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            const newLanguage = e.target.value
            dispatch(setEditorLanguage(newLanguage))
            dispatch(setRoomLanguage(newLanguage))
            if (isConnected && roomId) {
              sendCodeUpdate(localCode, newLanguage)
            }
          }}
          className="language-select"
        >
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
      </div>

      {/* Code editor */}
      <div className="editor-wrapper">
        <textarea
          ref={textareaRef}
          value={localCode}
          onChange={handleCodeChange}
          onSelect={handleCursorChange}
          onFocus={() => setIsPointerActive(true)}
          onBlur={() => setIsPointerActive(false)}
          onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            const textarea = e.currentTarget
            
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) {
              setTimeout(() => {
                dispatch(setCursorPosition(textarea.selectionStart))
              }, 0)
            }
            
            if (e.key === 'Tab') {
              if (autocompleteSuggestion) {
                e.preventDefault()
                applyAutocomplete()
              } else {
                e.preventDefault()
                const start = textarea.selectionStart
                const end = textarea.selectionEnd
                const newCode = 
                  localCode.substring(0, start) + 
                  '    ' + 
                  localCode.substring(end)
                setLocalCode(newCode)
                dispatch(setCode(newCode))
                setTimeout(() => {
                  const newPos = start + 4
                  textarea.selectionStart = textarea.selectionEnd = newPos
                  dispatch(setCursorPosition(newPos))
                }, 0)
              }
            }
            
            if (e.key === 'Enter' && autocompleteSuggestion && !e.shiftKey) {
              e.preventDefault()
              applyAutocomplete()
            }
            
            if (e.key === 'Escape' && autocompleteSuggestion) {
              e.preventDefault()
              dispatch(clearAutocomplete())
            }
          }}
          className="code-textarea"
          placeholder="Start typing your code here..."
          spellCheck={false}
        />
        
        {autocompleteSuggestion && textareaRef.current && !isAutocompleteLoading && isPointerActive && (
          <AutocompletePopup
            suggestion={autocompleteSuggestion}
            onApply={applyAutocomplete}
            onDismiss={() => dispatch(clearAutocomplete())}
            textareaRef={textareaRef}
            code={localCode}
            cursorPosition={cursorPosition}
          />
        )}
        
        {isAutocompleteLoading && (
          <div className="autocomplete-loading-indicator">
            <span className="loading-spinner">⏳</span>
            <span>Getting suggestions...</span>
          </div>
        )}
      </div>

      {autocompleteError && (
        <div className="autocomplete-error" style={{ 
          padding: '8px', 
          marginTop: '8px', 
          backgroundColor: '#fee', 
          color: '#c33', 
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          Autocomplete Error: {autocompleteError}
        </div>
      )}
    </div>
  )
}

export default CodeEditor

