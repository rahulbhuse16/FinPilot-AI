from uuid import UUID

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

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


def get_customer_by_id(
    session: Session,
    customer_id: UUID,
) -> dict | None:

    row = (
        session.query(*CUSTOMER_COLUMNS)
        .filter(Customer.id == customer_id)
        .one_or_none()
    )

    return dict(row._mapping) if row else None


def create_customer(
    session: Session,
    values: dict,
) -> dict:

    customer = Customer(**values)

    session.add(customer)
    session.flush()
    session.refresh(customer)

    return _serialize(customer)


def update_customer(
    session: Session,
    customer_id: UUID,
    updates: dict,
) -> dict | None:

    customer = (
        session.query(Customer)
        .filter(Customer.id == customer_id)
        .first()
    )

    if not customer:
        return None

    for field, value in updates.items():
        setattr(customer, field, value)

    session.flush()
    session.refresh(customer)

    return _serialize(customer)


def delete_customer(
    session: Session,
    customer_id: UUID,
) -> bool:

    customer = (
        session.query(Customer)
        .filter(Customer.id == customer_id)
        .first()
    )

    if not customer:
        return False

    session.delete(customer)

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


def get_customers(
    session: Session,
    search: str | None = None,
    page: int = 1,
    page_size: int = 20,
) -> dict:

    offset = (page - 1) * page_size

    query = session.query(Customer)

    if search:
        search_pattern = f"%{search}%"

        query = query.filter(
            or_(
                Customer.full_name.ilike(search_pattern),
                Customer.email.ilike(search_pattern),
                Customer.customer_code.ilike(search_pattern),
            )
        )

    total = query.count()

    customers = (
        query
        .order_by(Customer.full_name)
        .limit(page_size)
        .offset(offset)
        .all()
    )

    return {
        "items": [_serialize(customer) for customer in customers],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }