# Pair Programming API - Backend

A real-time collaborative coding application built with FastAPI, WebSockets, and PostgreSQL.

## Overview

This application allows multiple users to collaborate on code in real-time. Users can create rooms, join existing rooms, and see each other's code changes instantly. The system also provides a mocked AI autocomplete feature.

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── database.py          # Database connection and configuration
│   ├── models.py            # SQLAlchemy database models
│   ├── schemas.py           # Pydantic schemas for request/response validation
│   ├── routers/             # API endpoint definitions
│   │   ├── __init__.py
│   │   ├── rooms.py         # Room creation and management endpoints
│   │   ├── autocomplete.py  # Autocomplete endpoint
│   │   └── websocket.py     # WebSocket endpoint for real-time collaboration
│   └── services/            # Business logic
│       ├── __init__.py
│       ├── room_service.py      # Room-related business logic
│       └── autocomplete_service.py  # Autocomplete logic
├── requirements.txt         # Python dependencies
├── .env.example            # Example environment variables
└── README.md               # This file
```

## Architecture and Design Choices

### 1. **Separation of Concerns**
   - **Routers**: Handle HTTP requests and WebSocket connections
   - **Services**: Contain business logic (separated from routing)
   - **Models**: Define database structure
   - **Schemas**: Validate request/response data

### 2. **Database Design**
   - Using PostgreSQL for persistent storage
   - Single `rooms` table storing room ID, code content, and language
   - Simple structure suitable for the prototype

### 3. **WebSocket Implementation**
   - In-memory connection management (stored in `active_connections` dictionary)
   - Last-write-wins synchronization (simple but effective for prototype)
   - Broadcasts code updates to all users in the same room

### 4. **Autocomplete**
   - Rule-based mocked suggestions
   - Detects common code patterns (function definitions, loops, conditionals, etc.)
   - Returns appropriate suggestions based on context

## Setup Instructions

> **Note:** This is the backend setup. For full application setup including frontend, see the root [README.md](../README.md).

### Prerequisites
- Python 3.8 or higher
- PostgreSQL database installed and running
- pip (Python package manager)

### Step 1: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Set Up Database

1. Create a PostgreSQL database:
```sql
CREATE DATABASE pair_programming;
```

2. Create a `.env` file in the `backend` directory:
```bash
cp .env.example .env
```

3. Edit `.env` and update the `DATABASE_URL` with your PostgreSQL credentials:
```
DATABASE_URL=postgresql://username:password@localhost:5432/pair_programming
```

### Step 3: Run the Application

```bash
# From the backend directory
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Interactive API docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

## API Endpoints

### 1. Create Room
**POST** `/rooms/`

Creates a new room and returns a room ID.

**Response:**
```json
{
  "roomId": "uuid-string"
}
```

**Note:** Returns `roomId` (camelCase) to match the requirement specification.

**Example:**
```bash
curl -X POST http://localhost:8000/rooms/
```

### 2. Get Room Information
**GET** `/rooms/{room_id}`

Retrieves information about a specific room.

**Response:**
```json
{
  "room_id": "uuid-string",
  "code": "current code content",
  "language": "python"
}
```

### 3. Autocomplete
**POST** `/autocomplete/`

Get code completion suggestions.

**Request:**
```json
{
  "code": "def ",
  "cursorPosition": 4,
  "language": "python"
}
```

**Note:** Uses `cursorPosition` (camelCase) to match the requirement specification. The API also accepts `cursor_position` (snake_case) for compatibility.

**Response:**
```json
{
  "suggestion": "my_function():"
}
```

### 4. WebSocket Connection
**WS** `/ws/{room_id}`

Connect to a room for real-time collaboration.

**Message Format (Client → Server):**
```json
{
  "code": "updated code content",
  "language": "python"
}
```

**Message Format (Server → Client):**
```json
{
  "type": "code_update",
  "code": "updated code content",
  "language": "python"
}
```

**Initial Connection Message (Server → Client):**
```json
{
  "type": "initial_code",
  "code": "current code in room",
  "language": "python"
}
```

## Testing with Postman or Browser

### Testing REST Endpoints

1. **Create a Room:**
   - Method: POST
   - URL: http://localhost:8000/rooms/
   - You'll receive a `room_id` in the response

2. **Get Room Info:**
   - Method: GET
   - URL: http://localhost:8000/rooms/{room_id}
   - Replace `{room_id}` with the ID from step 1

3. **Test Autocomplete:**
   - Method: POST
   - URL: http://localhost:8000/autocomplete/
   - Body (JSON):
     ```json
     {
       "code": "def ",
       "cursor_position": 4,
       "language": "python"
     }
     ```

### Testing WebSocket

You can test WebSocket connections using:
- **Browser Console:**
  ```javascript
  const ws = new WebSocket('ws://localhost:8000/ws/YOUR_ROOM_ID');
  ws.onmessage = (event) => console.log(JSON.parse(event.data));
  ws.send(JSON.stringify({code: "print('Hello')", language: "python"}));
  ```

- **Online Tools:** Use websocket.org/echo.html or similar WebSocket testing tools

## Limitations and Known Issues

1. **No Authentication**: Anyone with a room ID can join and edit
2. **Simple Sync**: Uses last-write-wins, which may cause conflicts with rapid typing
3. **In-Memory Connections**: WebSocket connections are stored in memory, so they're lost on server restart
4. **No Conflict Resolution**: No operational transformation
5. **Basic Autocomplete**: Suggestions are rule-based, not AI-powered
6. **No User Identification**: Can't tell which user made which change

## What Would I Improve with More Time?

1. **Better Synchronization:**
   - Implement Operational Transformation (OT) for better conflict resolution
   - Add cursor position tracking for each user

2. **User Management:**
   - Add user authentication and identification
   - Show which user is typing/editing
   - User presence indicators

3. **Enhanced Features:**
   - Code syntax highlighting support
   - Multiple file editing
   - Code execution/compilation
   - Chat functionality within rooms
   - Room history/version control

4. **Production Readiness:**
   - Use Redis for WebSocket connection management (for horizontal scaling)
   - Add proper error handling and logging
   - Implement rate limiting
   - Set up proper CORS configuration
   - Add unit and integration tests
   - Implement proper security measures

5. **Real AI Autocomplete:**
   - Integrate with OpenAI API or similar
   - Context-aware suggestions
   - Multi-line completions

6. **Performance:**
   - Optimize database queries
   - Add caching layer
   - Implement connection pooling optimizations

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify database credentials in `.env` file
- Check if database exists: `psql -U postgres -l`

### Port Already in Use
- Change the port: `uvicorn app.main:app --reload --port 8001`
- Or stop the process using port 8000

### Import Errors
- Make sure you're running from the correct directory
- Verify all dependencies are installed: `pip list`
- Check Python version: `python --version` (should be 3.8+)

## License

This is a prototype project for demonstration purposes.

