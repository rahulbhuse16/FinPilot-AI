from decimal import Decimal
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


class LoanResponse(BaseModel):
    id: UUID
    loan_type: str
    principal_amount: Decimal
    outstanding_amount: Decimal
    interest_rate: Decimal
    monthly_emi: Decimal
    status: str
    salary_slip_url: str | None=None




class LoanCreateRequest(BaseModel):
    loan_type: str = Field(
        min_length=1,
        max_length=50,
    )


    principal_amount: Decimal = Field(
        gt=0,
        max_digits=15,
        decimal_places=2,
    )

    interest_rate: Decimal = Field(
        ge=0,
        le=100,
        max_digits=5,
        decimal_places=2,
    )

    monthly_emi: Decimal = Field(
        gt=0,
        max_digits=15,
        decimal_places=2,
    )

class UpdateLoanRequest(BaseModel): 
    loan_id: str
    status: Literal["ACTIVE", "REJECTED"]


class LoanPaymentRequest(BaseModel):
    amount: Decimal = Field(
        gt=0,
        max_digits=15,
        decimal_places=2,
    )


class LoanPaymentResponse(LoanResponse):
    amount_paid: Decimal
