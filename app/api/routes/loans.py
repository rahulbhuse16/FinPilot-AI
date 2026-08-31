from uuid import UUID
from fastapi import APIRouter
from app.core.database import get_db
from app.schemas.loan import LoanResponse
from app.services.loan_service import get_customer_loans


router = APIRouter(
    prefix="/customers",
    tags=["Loans"],
)


@router.get(
    "/{customer_id}/loans",
    response_model=list[LoanResponse],
)
async def get_customer_loans_route(
    customer_id: UUID,
):
    async with get_db() as session:

        loans = await get_customer_loans(
            session,
            customer_id,
        )

    return loans