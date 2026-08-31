from contextlib import asynccontextmanager
from typing import AsyncGenerator

from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import settings


engine = create_async_engine(
    settings.sqlalchemy_database_url,
    pool_size=2,
    max_overflow=8,
    pool_pre_ping=True,
    echo=settings.debug,
)

SessionLocal = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
    autoflush=False,
)


async def connect_db() -> None:
    async with engine.connect() as connection:
        await connection.execute(text("SELECT 1"))


async def close_db() -> None:
    await engine.dispose()


@asynccontextmanager
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        yield session
