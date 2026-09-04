from decimal import Decimal
from uuid import UUID

from sqlalchemy.orm import Session

from app.models import Account, Transaction


def detect_transaction_anomalies(
    session: Session,
    customer_id: UUID | str,
    limit: int = 50,
) -> list[dict]:

    transactions = (
        session.query(
            Transaction.id,
            Transaction.amount,
            Transaction.transaction_type,
            Transaction.category,
            Transaction.merchant,
            Transaction.description,
            Transaction.transaction_time,
        )
        .join(
            Account,
            Account.id == Transaction.account_id,
        )
        .filter(
            Account.customer_id == customer_id
        )
        .order_by(
            Transaction.transaction_time.desc()
        )
        .limit(limit)
        .all()
    )

    transactions = [
        {
            "id": transaction.id,
            "amount": transaction.amount,
            "transaction_type": transaction.transaction_type,
            "category": transaction.category,
            "merchant": transaction.merchant,
            "description": transaction.description,
            "transaction_time": transaction.transaction_time,
        }
        for transaction in transactions
    ]

    if not transactions:
        return []

    amounts = [
        Decimal(str(transaction["amount"]))
        for transaction in transactions
    ]

    average_amount = sum(amounts) / len(amounts)

    anomalies = []

    for transaction in transactions:

        amount = Decimal(
            str(transaction["amount"])
        )

        reasons = []

        # Large transaction
        if (
            average_amount > 0
            and amount >= average_amount * Decimal("3")
        ):
            reasons.append(
                "transaction is significantly "
                "larger than the customer's "
                "recent average"
            )

        # High-value transfer
        if (
            transaction["transaction_type"] == "DEBIT"
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
                    "merchant": transaction["merchant"],
                    "category": transaction["category"],
                    "transaction_time": (
                        transaction["transaction_time"]
                        .isoformat()
                    ),
                    "reasons": reasons,
                }
            )

    return anomalies