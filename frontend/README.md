# Pair Programming Frontend

React + TypeScript + Redux Toolkit frontend for real-time collaborative coding.

## Features

- ✅ Create new rooms or join existing ones
- ✅ Real-time code collaboration via WebSocket
- ✅ Autocomplete suggestions (600ms debounce)
- ✅ Multiple language support
- ✅ Clean, beginner-friendly code structure

## Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── RoomSelector.tsx    # Room creation/joining UI
│   │   └── CodeEditor.tsx      # Code editor with WebSocket
│   ├── hooks/              # Custom React hooks
│   │   ├── useWebSocket.ts     # WebSocket connection management
│   │   └── useAutocomplete.ts  # Autocomplete with debouncing
│   ├── store/              # Redux store
│   │   ├── store.ts            # Store configuration
│   │   └── slices/             # Redux slices
│   │       ├── roomSlice.ts        # Room state management
│   │       ├── editorSlice.ts      # Editor state management
│   │       └── websocketSlice.ts   # WebSocket state management
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js 16+ and npm/yarn
- Backend server running on http://localhost:8000

### Installation

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Start the development server:**
```bash
npm run dev
```

The app will be available at http://localhost:3000

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

## Usage

1. **Create a Room:**
   - Click "Create Room" button
   - You'll be redirected to the code editor
   - Share the Room ID with others to collaborate

2. **Join a Room:**
   - Enter a Room ID in the input field
   - Click "Join Room"
   - You'll see the current code in the room

3. **Code Collaboration:**
   - Type code in the editor
   - Changes are synced in real-time to all users
   - Connection status is shown in the header

4. **Autocomplete:**
   - Type code and wait 600ms
   - Autocomplete suggestion will appear
   - Press Ctrl+Enter or click "Apply" to use the suggestion

## Redux Store Structure

### Room Slice
- `roomId`: Current room ID
- `code`: Room code content
- `language`: Programming language
- `isLoading`: Loading state
- `error`: Error messages

### Editor Slice
- `code`: Editor code content
- `cursorPosition`: Current cursor position
- `language`: Programming language
- `autocompleteSuggestion`: Current autocomplete suggestion
- `isAutocompleteLoading`: Autocomplete loading state

### WebSocket Slice
- `isConnected`: WebSocket connection status
- `isConnecting`: Connection in progress
- `error`: Connection errors
- `lastUpdate`: Timestamp of last update

## API Integration

The frontend connects to the backend API at `http://localhost:8000`:

- **POST /rooms/** - Create new room
- **GET /rooms/{roomId}** - Get room information
- **POST /autocomplete/** - Get autocomplete suggestions
- **WS /ws/{roomId}** - WebSocket connection for real-time updates

## Custom Hooks

### `useWebSocket(roomId, onMessage?)`
Manages WebSocket connection for a room:
- Automatically connects when roomId is provided
- Handles reconnection and error states
- Provides `sendCodeUpdate()` function
- Syncs code updates with Redux store

### `useAutocomplete()`
Handles autocomplete with debouncing:
- Automatically triggers after 600ms of inactivity
- Calls autocomplete API with current code and cursor position
- Updates Redux store with suggestions

## Styling

The app uses a dark theme similar to VS Code:
- Background: #1e1e1e
- Editor background: #1e1e1e
- Accent color: #4ec9b0
- Text color: #d4d4d4

## Troubleshooting

### WebSocket Connection Issues
- Ensure backend is running on port 8000
- Check browser console for connection errors
- Verify room ID is correct

### Autocomplete Not Working
- Check browser console for API errors
- Ensure backend autocomplete endpoint is accessible
- Verify 600ms debounce is working (wait after typing)

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 16+)

## Development Notes

- The code is structured to be beginner-friendly with extensive comments
- Redux Toolkit is used for state management (minimal implementation as per requirements)
- WebSocket connection is managed through a custom hook for reusability
- Autocomplete is debounced to 600ms as specified in requirements

