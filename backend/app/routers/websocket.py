import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.database import SessionLocal
from app.services import room_service

router = APIRouter()
active_connections: dict[str, list[WebSocket]] = {}


@router.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await websocket.accept()
    
    db = SessionLocal()
    
    try:
        if not room_service.room_exists(db, room_id):
            await websocket.close(code=1008, reason="Room not found")
            return
        
        room = room_service.get_room_by_id(db, room_id)
        current_code = room.code if room else ""
        
        if room_id not in active_connections:
            active_connections[room_id] = []
        
        active_connections[room_id].append(websocket)
        
        await websocket.send_json({
            "type": "initial_code",
            "code": current_code,
            "language": room.language if room else "python"
        })
        
        while True:
            data = await websocket.receive_text()
            
            try:
                message = json.loads(data)
                code = message.get("code", "")
                language = message.get("language", "python")
                
                room_service.update_room_code(db, room_id, code, language)
                
                for connection in active_connections[room_id]:
                    if connection != websocket:
                        try:
                            await connection.send_json({
                                "type": "code_update",
                                "code": code,
                                "language": language
                            })
                        except:
                            pass
                            
            except json.JSONDecodeError:
                pass
                
    except WebSocketDisconnect:
        if room_id in active_connections:
            if websocket in active_connections[room_id]:
                active_connections[room_id].remove(websocket)
            if len(active_connections[room_id]) == 0:
                del active_connections[room_id]
    except Exception as e:
        if room_id in active_connections:
            if websocket in active_connections[room_id]:
                active_connections[room_id].remove(websocket)
    finally:
        db.close()

