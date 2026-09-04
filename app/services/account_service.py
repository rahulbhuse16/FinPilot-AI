from uuid import UUID

from sqlalchemy.orm import Session

from app.models import Account


def create_account(
    session: Session,
    customer_id: UUID,
    values: dict,
) -> dict:

    account = Account(
        customer_id=customer_id,
        **values,
    )

    session.add(account)

    session.commit()
    session.refresh(account)

    return {
        "id": account.id,
        "account_number": account.account_number,
        "account_type": account.account_type,
        "balance": account.balance,
        "currency": account.currency,
        "status": account.status,
    }


def get_accounts_by_customer(
    session: Session,
    customer_id: UUID,
) -> list[dict]:

    accounts = (
        session.query(Account)
        .filter(Account.customer_id == customer_id)
        .order_by(Account.created_at.desc())
        .all()
    )

    return [
        {
            "id": account.id,
            "account_number": account.account_number,
            "account_type": account.account_type,
            "balance": account.balance,
            "currency": account.currency,
            "status": account.status,
        }
        for account in accounts
    ]