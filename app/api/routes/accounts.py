from uuid import UUID

from fastapi import APIRouter

from app.core.database import get_db
from app.schemas.account import AccountResponse
from app.services.account_service import get_accounts_by_customer


router = APIRouter(
    prefix="/customers",
    tags=["Accounts"],
)


@router.get(
    "/{customer_id}/accounts",
    response_model=list[AccountResponse],
)
async def get_customer_accounts(
    customer_id: UUID,
):
    async with get_db() as connection:

        accounts = await get_accounts_by_customer(
            connection,
            customer_id,
        )

    return accounts