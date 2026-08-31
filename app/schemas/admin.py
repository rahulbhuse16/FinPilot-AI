from decimal import Decimal

from pydantic import BaseModel, EmailStr, Field


class CustomerCreateRequest(BaseModel):
    customer_code: str = Field(min_length=1, max_length=50)
    full_name: str = Field(min_length=1, max_length=150)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=30)
    monthly_income: Decimal = Decimal("0")
    credit_score: int | None = None
    risk_level: str | None = Field(default=None, max_length=20)


class CustomerUpdateRequest(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=150)
    email: EmailStr | None = None
    phone: str | None = Field(default=None, max_length=30)
    monthly_income: Decimal | None = None
    credit_score: int | None = None
    risk_level: str | None = Field(default=None, max_length=20)


class AccountCreateRequest(BaseModel):
    account_number: str = Field(min_length=1, max_length=50)
    account_type: str = Field(min_length=1, max_length=30)
    balance: Decimal = Decimal("0")
    currency: str = Field(default="INR", max_length=10)
    status: str = Field(default="ACTIVE", max_length=20)


class UserCreateRequest(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=1, max_length=150)
    password: str = Field(min_length=8, max_length=128)
    role: str = Field(pattern="^(ADMIN|CUSTOMER)$")
    customer_code: str | None = None
