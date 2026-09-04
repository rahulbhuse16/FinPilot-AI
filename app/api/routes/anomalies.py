from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

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
def transaction_anomalies(
    customer_id: UUID,
    db: Session = Depends(get_db),
):
    return detect_transaction_anomalies(
        db,
        customer_id,
    )