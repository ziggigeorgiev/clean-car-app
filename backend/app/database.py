import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv() # Load environment variables from .env

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Create the SQLAlchemy engine
# pool_pre_ping=True helps with long-lived connections
engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)

# Create a SessionLocal class for database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for declarative models
Base = declarative_base()

# Dependency to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# For async operations with SQLAlchemy, you'd use AsyncEngine and AsyncSession
# from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
# ASYNC_SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
# async_engine = create_async_engine(ASYNC_SQLALCHEMY_DATABASE_URL, echo=True)
# AsyncSessionLocal = sessionmaker(async_engine, class_=AsyncSession, expire_on_commit=False)
# async def get_async_db():
#     async with AsyncSessionLocal() as session:
#         yield session