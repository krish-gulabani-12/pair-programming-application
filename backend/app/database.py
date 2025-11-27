"""
Database configuration and session management.
This file handles the connection to PostgreSQL database using SQLAlchemy.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get database URL from environment variable
# Format: postgresql://username:password@localhost:5432/database_name
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/pair_programming"
)

# Create database engine
# This is the connection pool to the database
engine = create_engine(DATABASE_URL)

# Create a session factory
# This will be used to create database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all database models
# All models will inherit from this
Base = declarative_base()


def get_db():
    """
    Dependency function to get a database session.
    FastAPI will call this function to get a database session for each request.
    After the request is done, it will close the session automatically.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

