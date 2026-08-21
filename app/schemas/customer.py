from uuid import UUID

from pydantic import BaseModel


class CustomerResponse(BaseModel):
    id: UUID
    customer_code: str
    full_name: str
    email: str
    phone: str | None = None
    monthly_income: float | None = None
    credit_score: int | None = None
    risk_level: str | None = None


class PaginatedCustomersResponse(BaseModel):
    items: list[CustomerResponse]
    total: int
    page: int
    page_size: int
    total_pages: int