from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.customer_360 import Customer360Summary
from app.services.customer_360_service import get_customer_360


router = APIRouter(
    prefix="/customers",
    tags=["Customer 360"],
)


@router.get(
    "/{customer_id}/360",
    response_model=Customer360Summary,
)
def customer_360(
    customer_id: UUID,
    db: Session = Depends(get_db),
):
    customer = get_customer_360(
        db,
        customer_id,
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    return customer