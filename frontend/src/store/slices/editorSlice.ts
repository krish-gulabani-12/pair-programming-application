import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

const API_BASE_URL = `http://${import.meta.env.VITE_BACKEND_URL}:8000`

interface EditorState {
  code: string
  cursorPosition: number
  language: string
  autocompleteSuggestion: string | null
  isAutocompleteLoading: boolean
  autocompleteError: string | null
}

const initialState: EditorState = {
  code: '',
  cursorPosition: 0,
  language: 'python',
  autocompleteSuggestion: null,
  isAutocompleteLoading: false,
  autocompleteError: null,
}

export const getAutocomplete = createAsyncThunk(
  'editor/autocomplete',
  async (params: { code: string; cursorPosition: number; language: string }) => {
    const response = await fetch(`${API_BASE_URL}/autocomplete/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: params.code,
        cursorPosition: params.cursorPosition,
        language: params.language,
      }),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = 'Failed to get autocomplete'
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.detail || errorData.message || errorMessage
      } catch {
        errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`
      }
      throw new Error(errorMessage)
    }
    
    const data = await response.json()
    return data.suggestion
  }
)

const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setCode: (state, action: PayloadAction<string>) => {
      state.code = action.payload
      state.autocompleteSuggestion = null
    },
    setCursorPosition: (state, action: PayloadAction<number>) => {
      state.cursorPosition = action.payload
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload
    },
    clearAutocomplete: (state) => {
      state.autocompleteSuggestion = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAutocomplete.pending, (state) => {
        state.isAutocompleteLoading = true
        state.autocompleteError = null
      })
      .addCase(getAutocomplete.fulfilled, (state, action) => {
        state.isAutocompleteLoading = false
        state.autocompleteSuggestion = action.payload
        state.autocompleteError = null
      })
      .addCase(getAutocomplete.rejected, (state, action) => {
        state.isAutocompleteLoading = false
        state.autocompleteError = action.error.message || 'Failed to get autocomplete'
        state.autocompleteSuggestion = null
      })
  },
})

export const { setCode, setCursorPosition, setLanguage, clearAutocomplete } = editorSlice.actions
export default editorSlice.reducer

