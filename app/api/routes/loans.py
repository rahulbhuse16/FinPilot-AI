from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

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
def get_customer_loans_route(
    customer_id: UUID,
    db: Session = Depends(get_db),
):
    return get_customer_loans(
        db,
        customer_id,
    )