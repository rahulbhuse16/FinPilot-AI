from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Account


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
