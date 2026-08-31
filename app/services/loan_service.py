from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Loan


async def get_customer_loans(
    session: AsyncSession,
    customer_id: UUID,
) -> list[dict]:

    result = await session.execute(
        select(
            Loan.id,
            Loan.loan_type,
            Loan.principal_amount,
            Loan.outstanding_amount,
            Loan.interest_rate,
            Loan.monthly_emi,
            Loan.status,
        )
        .where(Loan.customer_id == customer_id)
        .order_by(Loan.created_at.desc())
    )

    return [
        dict(row)
        for row in result.mappings().all()
    ]
