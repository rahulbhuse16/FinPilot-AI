from uuid import UUID

from fastapi import APIRouter

from app.core.database import get_db
from app.services.anomaly_service import (
    detect_transaction_anomalies,
)


router = APIRouter(
    prefix="/customers",
    tags=["Transaction Intelligence"],
)


@router.get(
    "/{customer_id}/transaction-anomalies"
)
async def transaction_anomalies(
    customer_id: str,
):

    async with get_db() as session:

        return await detect_transaction_anomalies(
            session,
            customer_id,
        )