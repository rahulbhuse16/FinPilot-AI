from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel


class TransactionResponse(BaseModel):
    id: UUID
    account_id: UUID
    amount: Decimal
    transaction_type: str
    category: str | None
    merchant: str | None
    description: str | None
    transaction_time: datetime