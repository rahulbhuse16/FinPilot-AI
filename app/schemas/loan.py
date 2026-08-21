from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel


class LoanResponse(BaseModel):
    id: UUID
    loan_type: str
    principal_amount: Decimal
    outstanding_amount: Decimal
    interest_rate: Decimal
    monthly_emi: Decimal
    status: str