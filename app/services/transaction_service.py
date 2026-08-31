from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Account, Transaction


async def get_customer_transactions(
    session: AsyncSession,
    customer_id: UUID,
    limit: int = 50,
) -> list[dict]:

    result = await session.execute(
        select(
            Transaction.id,
            Transaction.account_id,
            Transaction.amount,
            Transaction.transaction_type,
            Transaction.category,
            Transaction.merchant,
            Transaction.description,
            Transaction.transaction_time,
        )
        .join(Account, Account.id == Transaction.account_id)
        .where(Account.customer_id == customer_id)
        .order_by(Transaction.transaction_time.desc())
        .limit(limit)
    )

    return [
        dict(row)
        for row in result.mappings().all()
    ]
