from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel


class AccountResponse(BaseModel):
    id: UUID
    account_number: str
    account_type: str
    balance: Decimal
    currency: str
    status: str