from pydantic import BaseModel, ConfigDict
from typing import Optional


class RoomCreateResponse(BaseModel):
    roomId: str

    class Config:
        from_attributes = True
        populate_by_name = True


class RoomInfo(BaseModel):
    room_id: str
    code: str
    language: str

    class Config:
        from_attributes = True


class AutocompleteRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    code: str
    cursorPosition: int
    language: str = "python"


class AutocompleteResponse(BaseModel):
    suggestion: str


class WebSocketMessage(BaseModel):
    room_id: str
    code: str
    language: Optional[str] = "python"

