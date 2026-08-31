from uuid import UUID

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Customer


CUSTOMER_COLUMNS = (
    Customer.id,
    Customer.customer_code,
    Customer.full_name,
    Customer.email,
    Customer.phone,
    Customer.monthly_income,
    Customer.credit_score,
    Customer.risk_level,
)


async def get_customer_by_id(
    session: AsyncSession,
    customer_id: UUID,
) -> dict | None:

    result = await session.execute(
        select(*CUSTOMER_COLUMNS).where(
            Customer.id == customer_id
        )
    )

    row = result.mappings().one_or_none()

    return dict(row) if row else None


async def create_customer(
    session: AsyncSession,
    values: dict,
) -> dict:

    customer = Customer(**values)

    session.add(customer)

    await session.flush()
    await session.refresh(customer)

    return _serialize(customer)


async def update_customer(
    session: AsyncSession,
    customer_id: UUID,
    updates: dict,
) -> dict | None:

    customer = await session.get(Customer, customer_id)

    if not customer:
        return None

    for field, value in updates.items():
        setattr(customer, field, value)

    await session.flush()
    await session.refresh(customer)

    return _serialize(customer)


async def delete_customer(
    session: AsyncSession,
    customer_id: UUID,
) -> bool:

    customer = await session.get(Customer, customer_id)

    if not customer:
        return False

    await session.delete(customer)

    return True


def _serialize(customer: Customer) -> dict:
    return {
        "id": customer.id,
        "customer_code": customer.customer_code,
        "full_name": customer.full_name,
        "email": customer.email,
        "phone": customer.phone,
        "monthly_income": customer.monthly_income,
        "credit_score": customer.credit_score,
        "risk_level": customer.risk_level,
    }


async def get_customers(
    session: AsyncSession,
    search: str | None = None,
    page: int = 1,
    page_size: int = 20,
) -> dict:

    offset = (page - 1) * page_size

    filters = []

    if search:
        search_pattern = f"%{search}%"

        filters.append(
            or_(
                Customer.full_name.ilike(search_pattern),
                Customer.email.ilike(search_pattern),
                Customer.customer_code.ilike(search_pattern),
            )
        )

    total = await session.scalar(
        select(func.count())
        .select_from(Customer)
        .where(*filters)
    )

    result = await session.execute(
        select(*CUSTOMER_COLUMNS)
        .where(*filters)
        .order_by(Customer.full_name)
        .limit(page_size)
        .offset(offset)
    )

    items = [
        dict(row)
        for row in result.mappings().all()
    ]

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }
