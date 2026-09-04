from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

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
def health_check(
    db: Session = Depends(get_db),
):
    database_status = "healthy"

    try:
        db.execute(text("SELECT 1"))

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