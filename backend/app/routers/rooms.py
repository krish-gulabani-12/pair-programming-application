from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import RoomCreateResponse, RoomInfo
from app.services import room_service

router = APIRouter(prefix="/rooms", tags=["rooms"])


@router.post("/", response_model=RoomCreateResponse)
def create_room(db: Session = Depends(get_db)):
    room = room_service.create_room(db)
    return RoomCreateResponse(roomId=room.room_id)


@router.get("/{room_id}", response_model=RoomInfo)
def get_room(room_id: str, db: Session = Depends(get_db)):
    room = room_service.get_room_by_id(db, room_id)
    
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    return RoomInfo(
        room_id=room.room_id,
        code=room.code,
        language=room.language
    )

