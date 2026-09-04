from uuid import UUID, uuid4

from sqlalchemy.orm import Session

from app.core.security import (
    hash_password,
    verify_password,
)
from app.models import (
    ROLE_CUSTOMER,
    Customer,
    User,
)


def get_user_by_email(
    session: Session,
    email: str,
) -> User | None:

    return (
        session.query(User)
        .filter(
            User.email == email.lower()
        )
        .first()
    )


def get_user_by_id(
    session: Session,
    user_id: UUID,
) -> User | None:

    return session.get(User, user_id)


def create_user(
    session: Session,
    email: str,
    full_name: str,
    password: str,
    role: str = ROLE_CUSTOMER,
    customer_id: UUID | None = None,
) -> User:

    user = User(
        email=email.lower(),
        full_name=full_name,
        password_hash=hash_password(password),
        role=role,
        customer_id=customer_id,
    )

    session.add(user)

    session.flush()
    session.refresh(user)

    return user


def authenticate_user(
    session: Session,
    email: str,
    password: str,
) -> User | None:

    user = get_user_by_email(
        session,
        email,
    )

    if not user or not user.is_active:
        return None

    if not verify_password(
        password,
        user.password_hash,
    ):
        return None

    return user


def get_customer_by_code(
    session: Session,
    customer_code: str,
) -> Customer | None:

    return (
        session.query(Customer)
        .filter(
            Customer.customer_code == customer_code
        )
        .first()
    )


def has_user_for_customer(
    session: Session,
    customer_id: UUID,
) -> bool:

    existing = (
        session.query(User.id)
        .filter(
            User.customer_id == customer_id
        )
        .first()
    )

    return existing is not None


def create_customer_profile(
    session: Session,
    full_name: str,
    email: str,
) -> Customer:

    customer = Customer(
        customer_code=f"CUST-{uuid4().hex[:8].upper()}",
        full_name=full_name,
        email=email.lower(),
    )

    session.add(customer)

    session.flush()
    session.refresh(customer)

    return customer