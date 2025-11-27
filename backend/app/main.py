from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import rooms, autocomplete, websocket

app = FastAPI(
    title="Pair Programming API",
    description="Real-time collaborative coding application",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    Base.metadata.create_all(bind=engine)

app.include_router(rooms.router)
app.include_router(autocomplete.router)
app.include_router(websocket.router)

@app.get("/")
def root():
    return {
        "message": "Pair Programming API is running!",
        "docs": "/docs",
        "endpoints": {
            "create_room": "POST /rooms/",
            "get_room": "GET /rooms/{room_id}",
            "autocomplete": "POST /autocomplete/",
            "websocket": "WS /ws/{room_id}"
        }
    }

