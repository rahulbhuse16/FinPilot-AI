from fastapi import APIRouter
from sqlalchemy import text

from app.core.database import get_db
from app.schemas.health import HealthResponse


router = APIRouter(
    prefix="/health",
    tags=["Health"],
)


@router.get(
    "",
    response_model=HealthResponse,
)
async def health_check():

    database_status = "healthy"

    try:

        async with get_db() as session:

            await session.execute(
                text("SELECT 1")
            )

    except Exception:

        database_status = "unhealthy"

    overall_status = (
        "healthy"
        if database_status == "healthy"
        else "degraded"
    )

    return {
        "status": overall_status,
        "database": database_status,
        "version": "1.0.0",
    }