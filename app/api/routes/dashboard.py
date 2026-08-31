from fastapi import APIRouter
from sqlalchemy import select

from app.core.database import get_db
from app.models import Customer
from app.services.dashboard_service import (
    get_dashboard_overview,
)
from app.services.ai_insights_service import (
    generate_ai_insights,
)

from app.schemas.dashboard import (DashboardOverview)

from app.schemas.ai_insights import (AIInsightsResponse)

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get("/overview",response_model=DashboardOverview)
async def dashboard_overview():

    return await get_dashboard_overview()


@router.get("/ai-insights",response_model=AIInsightsResponse)
async def dashboard_ai_insights():

    async with get_db() as session:

        customer_ids = list(
            await session.scalars(
                select(Customer.id).order_by(Customer.id)
            )
        )

        return await generate_ai_insights(
            session,
            customer_ids,
        )