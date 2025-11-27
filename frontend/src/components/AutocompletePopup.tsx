import React, { useEffect, useRef, useState } from 'react'
import './AutocompletePopup.css'

interface AutocompletePopupProps {
  suggestion: string
  onApply: () => void
  onDismiss: () => void
  textareaRef: React.RefObject<HTMLTextAreaElement>
  code: string
  cursorPosition: number
}

const AutocompletePopup: React.FC<AutocompletePopupProps> = ({
  suggestion,
  onApply,
  onDismiss,
  textareaRef,
  code,
  cursorPosition,
}) => {
  const popupRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!textareaRef.current || !suggestion) {
      setVisible(false)
      return
    }

    const textarea = textareaRef.current
    const styles = window.getComputedStyle(textarea)
    const textBeforeCursor = code.substring(0, cursorPosition)
    const lines = textBeforeCursor.split('\n')
    const currentLine = lines.length - 1
    const textInCurrentLine = lines[currentLine] || ''
    const fontSize = parseFloat(styles.fontSize)
    const lineHeight = parseFloat(styles.lineHeight) || fontSize * 1.6
    const paddingTop = parseFloat(styles.paddingTop) || 20
    const paddingLeft = parseFloat(styles.paddingLeft) || 20
    
    const lineMirror = document.createElement('div')
    lineMirror.style.position = 'absolute'
    lineMirror.style.visibility = 'hidden'
    lineMirror.style.whiteSpace = 'pre'
    lineMirror.style.font = styles.font
    lineMirror.style.fontSize = styles.fontSize
    lineMirror.style.fontFamily = styles.fontFamily
    lineMirror.style.padding = '0'
    lineMirror.style.border = 'none'
    lineMirror.style.width = 'auto'
    lineMirror.style.height = 'auto'
    lineMirror.textContent = textInCurrentLine
    document.body.appendChild(lineMirror)
    
    const lineWidth = lineMirror.offsetWidth
    const lineHeightPx = lineMirror.offsetHeight || lineHeight
    document.body.removeChild(lineMirror)
    
    const textareaRect = textarea.getBoundingClientRect()
    const scrollTop = textarea.scrollTop
    const top = textareaRect.top + paddingTop + (currentLine * lineHeightPx) + lineHeightPx + 5 - scrollTop
    const left = textareaRect.left + paddingLeft + lineWidth + 10
    
    const popupWidth = 320
    const popupHeight = 120
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    let finalLeft = left
    let finalTop = top
    
    if (finalLeft + popupWidth > viewportWidth - 10) {
      finalLeft = Math.max(10, viewportWidth - popupWidth - 10)
    }
    
    if (finalTop + popupHeight > viewportHeight - 10) {
      finalTop = Math.max(10, top - popupHeight - lineHeightPx - 10)
    }
    
    if (finalLeft < 10) finalLeft = 10
    if (finalTop < 10) finalTop = 10
    
    setPosition({ top: finalTop, left: finalLeft })
    setVisible(true)
  }, [suggestion, textareaRef, code, cursorPosition])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!visible) return
      
      if (e.key === 'Tab' || (e.key === 'Enter' && !e.shiftKey)) {
        e.preventDefault()
        onApply()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onDismiss()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [visible, onApply, onDismiss])

  if (!visible) return null

  return (
    <div
      ref={popupRef}
      className="autocomplete-popup"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="autocomplete-popup-header">
        <span className="autocomplete-popup-label">💡 Suggestion</span>
        <button
          className="autocomplete-popup-close"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
      <div className="autocomplete-popup-content">
        <code className="autocomplete-popup-suggestion">{suggestion}</code>
      </div>
      <div className="autocomplete-popup-footer">
        <span className="autocomplete-popup-hint">
          Press <kbd>Tab</kbd> or <kbd>Enter</kbd> to apply • <kbd>Esc</kbd> to dismiss
        </span>
        <button
          className="autocomplete-popup-apply"
          onClick={onApply}
        >
          Apply
        </button>
      </div>
    </div>
  )
}

export default AutocompletePopup

