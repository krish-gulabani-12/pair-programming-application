import uuid
from sqlalchemy.orm import Session
from app.models import Room


def create_room(db: Session) -> Room:
    room_id = str(uuid.uuid4())
    new_room = Room(
        room_id=room_id,
        code="",
        language="python"
    )
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    return new_room


def get_room_by_id(db: Session, room_id: str) -> Room:
    return db.query(Room).filter(Room.room_id == room_id).first()


def update_room_code(db: Session, room_id: str, code: str, language: str = "python") -> Room:
    room = db.query(Room).filter(Room.room_id == room_id).first()
    if room:
        room.code = code
        room.language = language
        db.commit()
        db.refresh(room)
    return room


def room_exists(db: Session, room_id: str) -> bool:
    room = db.query(Room).filter(Room.room_id == room_id).first()
    return room is not None

