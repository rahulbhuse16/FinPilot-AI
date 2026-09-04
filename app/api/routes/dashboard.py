from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Customer
from app.services.dashboard_service import (
    get_dashboard_overview,
)
from app.services.ai_insights_service import (
    generate_ai_insights,
)
from app.schemas.dashboard import DashboardOverview
from app.schemas.ai_insights import AIInsightsResponse


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get(
    "/overview",
    response_model=DashboardOverview,
)
def dashboard_overview(
    db: Session = Depends(get_db),
):
    return get_dashboard_overview(db)


@router.get(
    "/ai-insights",
    response_model=AIInsightsResponse,
)
async def dashboard_ai_insights(
    db: Session = Depends(get_db),
):
    customer_ids = [
        customer_id
        for customer_id in (
            db.query(Customer.id)
            .order_by(Customer.id)
            .all()
        )
    ]

    return await generate_ai_insights(
        db,
        customer_ids,
    )