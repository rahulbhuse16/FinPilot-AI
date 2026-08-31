from decimal import Decimal
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Account, Transaction


async def detect_transaction_anomalies(
    session: AsyncSession,
    customer_id: UUID | str,
    limit: int = 50,
) -> list[dict]:

    result = await session.execute(
        select(
            Transaction.id,
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

    transactions = [
        dict(row)
        for row in result.mappings().all()
    ]

    if not transactions:
        return []

    amounts = [
        Decimal(str(t["amount"]))
        for t in transactions
    ]

    average_amount = (
        sum(amounts) / len(amounts)
    )

    anomalies = []

    for transaction in transactions:

        amount = Decimal(
            str(transaction["amount"])
        )

        reasons = []

        # --------------------------------
        # Large transaction
        # --------------------------------

        if (
            average_amount > 0
            and amount
            >= average_amount * Decimal("3")
        ):
            reasons.append(
                "transaction is significantly "
                "larger than the customer's "
                "recent average"
            )

        # --------------------------------
        # High-value transfer
        # --------------------------------

        if (
            transaction["transaction_type"]
            == "DEBIT"
            and amount >= Decimal("100000")
        ):
            reasons.append(
                "high-value debit transaction"
            )

        if reasons:

            anomalies.append(
                {
                    "transaction_id": str(
                        transaction["id"]
                    ),
                    "amount": str(amount),
                    "merchant": transaction[
                        "merchant"
                    ],
                    "category": transaction[
                        "category"
                    ],
                    "transaction_time": (
                        transaction[
                            "transaction_time"
                        ].isoformat()
                    ),
                    "reasons": reasons,
                }
            )

    return anomalies
