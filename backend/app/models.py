"""
Database models (tables) using SQLAlchemy.
This file defines the structure of our database tables.
"""

from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.sql import func
from app.database import Base


class Room(Base):
    """
    Room model - stores information about each coding room.
    Each room has a unique ID and stores the current code content.
    """
    __tablename__ = "rooms"

    # Room ID - this is the unique identifier for each room
    room_id = Column(String, primary_key=True, index=True)
    
    # Current code content in the room
    code = Column(Text, default="")
    
    # Language of the code (e.g., "python", "javascript")
    language = Column(String, default="python")
    
    # Timestamp when room was created
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Timestamp when room was last updated
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

