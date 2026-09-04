from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

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
def get_customer_accounts(
    customer_id: UUID,
    db: Session = Depends(get_db),
):
    accounts = get_accounts_by_customer(
        session=db,
        customer_id=customer_id,
    )

    return accounts