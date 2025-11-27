## Pair Programming Application

This repository contains a **full-stack real-time pair programming app** with separate backend and frontend projects.

### Backend (`backend`)

- **Stack**: FastAPI, SQLAlchemy, PostgreSQL
- **Features**:
  - Room creation and retrieval
  - Persistent room code + language
  - WebSocket-based real-time code sync
  - Simple rule-based autocomplete API
- **Usage**:
  - Configuration, setup, and detailed API docs are in `backend/README.md`

### Frontend (`frontend`)

- **Stack**: React, TypeScript, Vite, Redux Toolkit
- **Features**:
  - Room selection and joining
  - Collaborative code editor with live updates
  - Autocomplete popup, scoped to the active editor only
  - WebSocket integration with the backend
- **Usage**:
  - Installation, environment variables, and run commands are in `frontend/README.md`

### Development Workflow

- **Start backend**: see `backend/README.md`
- **Start frontend**: see `frontend/README.md`
- The frontend connects to the backend via HTTP (`/api`) and WebSocket (`/ws`) using the configured backend host.