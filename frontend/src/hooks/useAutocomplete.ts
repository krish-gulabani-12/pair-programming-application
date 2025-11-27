import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../store/store'
import { getAutocomplete, clearAutocomplete } from '../store/slices/editorSlice'

export const useAutocomplete = (isPointerActive: boolean) => {
  const dispatch = useDispatch<AppDispatch>()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  
  const code = useSelector((state: RootState) => state.editor.code)
  const cursorPosition = useSelector((state: RootState) => state.editor.cursorPosition)
  const language = useSelector((state: RootState) => state.editor.language)
  const isAutocompleteLoading = useSelector((state: RootState) => state.editor.isAutocompleteLoading)

  useEffect(() => {
    if (!isPointerActive) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      dispatch(clearAutocomplete())
      return
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    dispatch(clearAutocomplete())

    if (!code || code.trim().length === 0 || cursorPosition < 0 || cursorPosition > code.length) {
      return
    }

    timeoutRef.current = setTimeout(() => {
      const currentCode = code
      const currentCursorPos = cursorPosition
      
      if (currentCode && currentCursorPos >= 0 && currentCursorPos <= currentCode.length) {
        dispatch(getAutocomplete({
          code: currentCode,
          cursorPosition: currentCursorPos,
          language,
        }))
      }
    }, 600)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [code, cursorPosition, language, dispatch, isPointerActive])

  return {
    isAutocompleteLoading,
  }
}

