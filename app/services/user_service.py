from uuid import UUID, uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password, verify_password
from app.models import ROLE_CUSTOMER, Customer, User


async def get_user_by_email(
    session: AsyncSession,
    email: str,
) -> User | None:

    return await session.scalar(
        select(User).where(User.email == email.lower())
    )


async def get_user_by_id(
    session: AsyncSession,
    user_id: UUID,
) -> User | None:

    return await session.get(User, user_id)


async def create_user(
    session: AsyncSession,
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

    await session.flush()
    await session.refresh(user)

    return user


async def authenticate_user(
    session: AsyncSession,
    email: str,
    password: str,
) -> User | None:

    user = await get_user_by_email(session, email)

    if not user or not user.is_active:
        return None

    if not verify_password(password, user.password_hash):
        return None

    return user


async def get_customer_by_code(
    session: AsyncSession,
    customer_code: str,
) -> Customer | None:

    return await session.scalar(
        select(Customer).where(
            Customer.customer_code == customer_code
        )
    )


async def has_user_for_customer(
    session: AsyncSession,
    customer_id: UUID,
) -> bool:

    existing = await session.scalar(
        select(User.id).where(User.customer_id == customer_id)
    )

    return existing is not None


async def create_customer_profile(
    session: AsyncSession,
    full_name: str,
    email: str,
) -> Customer:

    customer = Customer(
        customer_code=f"CUST-{uuid4().hex[:8].upper()}",
        full_name=full_name,
        email=email.lower(),
    )

    session.add(customer)

    await session.flush()
    await session.refresh(customer)

    return customer
