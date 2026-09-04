from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel,Field


class AccountResponse(BaseModel):
    id: UUID
    account_number: str
    account_type: str
    balance: Decimal
    currency: str
    status: str

class AccountCreateRequest(BaseModel):
    account_number: str = Field(..., max_length=50)
    account_type: str = Field(..., max_length=30)
    balance: Decimal = Field(default=0, ge=0)
    currency: str = Field(default="INR", max_length=10)