from uuid import UUID

from sqlalchemy.orm import Session

from app.models import Account, Transaction
from datetime import datetime, timezone



def get_customer_transactions(
    session: Session,
    customer_id: UUID,
    limit: int = 50,
) -> list[dict]:

    transactions = (
        session.query(Transaction)
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

    return [
        {
            "id": transaction.id,
            "account_id": transaction.account_id,
            "amount": transaction.amount,
            "transaction_type": transaction.transaction_type,
            "category": transaction.category,
            "merchant": transaction.merchant,
            "description": transaction.description,
            "transaction_time": transaction.transaction_time,
        }
        for transaction in transactions
    ]


def create_transaction(
    session: Session,
    values: dict,
) -> dict:

    

    transaction = Transaction(
        account_id=values['account_id'],
        amount=values["amount"],
        transaction_type=values["transaction_type"],
        category=values.get("category"),
        merchant=values.get("merchant"),
        description=values.get("description"),
        transaction_time=values.get("transaction_time") or datetime.now(timezone.utc),
    )

    session.add(transaction)
    session.commit()
    session.refresh(transaction)


    return {
        "id": transaction.id,
        "account_id": transaction.account_id,
        "amount": transaction.amount,
        "transaction_type": transaction.transaction_type,
        "category": transaction.category,
        "merchant": transaction.merchant,
        "description": transaction.description,
        "transaction_time": transaction.transaction_time,
    }