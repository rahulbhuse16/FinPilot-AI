from fastapi import APIRouter

from app.core.database import get_db
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

    async with get_db() as connection:

        async with connection.cursor() as cursor:

            await cursor.execute(
                """
                SELECT id
                FROM customers
                ORDER BY id
                """
            )

            rows = await cursor.fetchall()

        customer_ids = [
            row[0]
            for row in rows
        ]

        return await generate_ai_insights(
            connection,
            customer_ids,
        )