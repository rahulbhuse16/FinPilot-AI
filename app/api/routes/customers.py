from uuid import UUID

from fastapi import APIRouter, HTTPException, Query

from app.core.database import get_db
from app.schemas.customer import (
    CustomerResponse,
    PaginatedCustomersResponse,
)
from app.services.customer_service import (
    get_customer_by_id,
    get_customers,
)


router = APIRouter(
    prefix="/customers",
    tags=["Customers"],
)


@router.get(
    "",
    response_model=PaginatedCustomersResponse,
)
async def get_customers_list(
    search: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    async with get_db() as session:

        customers = await get_customers(
            session=session,
            search=search,
            page=page,
            page_size=page_size,
        )

    return customers


@router.get(
    "/{customer_id}",
    response_model=CustomerResponse,
)
async def get_customer(customer_id: UUID):

    async with get_db() as session:

        customer = await get_customer_by_id(
            session,
            customer_id,
        )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    return customer