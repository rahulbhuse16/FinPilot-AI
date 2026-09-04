from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class TransactionCreateRequest(BaseModel):
    account_id: UUID

    amount: Decimal = Field(gt=0)

    transaction_type: str = Field(
        min_length=3,
        max_length=20,
    )

    category: str | None = None

    merchant: str | None = None

    description: str | None = None


class TransactionResponse(BaseModel):
    id: UUID
    account_id: UUID
    amount: Decimal
    transaction_type: str
    category: str | None
    merchant: str | None
    description: str | None
    transaction_time: datetime

