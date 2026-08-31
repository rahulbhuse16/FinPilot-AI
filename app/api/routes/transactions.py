from uuid import UUID

from fastapi import APIRouter, Query

from app.core.database import get_db
from app.schemas.transaction import TransactionResponse
from app.services.transaction_service import (
    get_customer_transactions,
)


router = APIRouter(
    prefix="/customers",
    tags=["Transactions"],
)


@router.get(
    "/{customer_id}/transactions",
    response_model=list[TransactionResponse],
)
async def get_transactions(
    customer_id: UUID,
    limit: int = Query(
        default=50,
        ge=1,
        le=200,
    ),
):
    async with get_db() as session:

        transactions = await get_customer_transactions(
            session,
            customer_id,
            limit,
        )

    return transactions