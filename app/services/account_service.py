from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Account


async def create_account(
    session: AsyncSession,
    customer_id: UUID,
    values: dict,
) -> dict:

    account = Account(customer_id=customer_id, **values)

    session.add(account)

    await session.flush()
    await session.refresh(account)

    return {
        "id": account.id,
        "account_number": account.account_number,
        "account_type": account.account_type,
        "balance": account.balance,
        "currency": account.currency,
        "status": account.status,
    }


async def get_accounts_by_customer(
    session: AsyncSession,
    customer_id: UUID,
) -> list[dict]:

    result = await session.execute(
        select(
            Account.id,
            Account.account_number,
            Account.account_type,
            Account.balance,
            Account.currency,
            Account.status,
        )
        .where(Account.customer_id == customer_id)
        .order_by(Account.created_at.desc())
    )

    return [
        dict(row)
        for row in result.mappings().all()
    ]
