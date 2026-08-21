from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel


class Customer360Summary(BaseModel):
    customer_id: UUID
    customer_code: str
    full_name: str

    monthly_income: Decimal
    credit_score: int | None
    risk_level: str | None

    total_balance: Decimal
    total_loan_outstanding: Decimal
    total_monthly_emi: Decimal

    debt_to_income_ratio: Decimal

    account_count: int
    active_loan_count: int

    total_transactions: int
    total_transaction_amount: Decimal