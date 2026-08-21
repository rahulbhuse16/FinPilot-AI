from contextlib import asynccontextmanager
from typing import AsyncGenerator

from psycopg_pool import AsyncConnectionPool

from app.core.config import settings


pool = AsyncConnectionPool(
    conninfo=settings.database_url,
    min_size=2,
    max_size=10,
    open=False,
)


async def connect_db() -> None:
    await pool.open()


async def close_db() -> None:
    await pool.close()


@asynccontextmanager
async def get_db() -> AsyncGenerator:
    async with pool.connection() as connection:
        yield connection