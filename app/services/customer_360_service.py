from decimal import Decimal
from uuid import UUID

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import Account, Customer, Loan, Transaction


def get_customer_360(
    session: Session,
    customer_id: UUID,
) -> dict | None:

    total_balance = (
        session.query(
            func.coalesce(func.sum(Account.balance), 0)
        )
        .filter(Account.customer_id == Customer.id)
        .correlate(Customer)
        .scalar_subquery()
    )

    total_loan_outstanding = (
        session.query(
            func.coalesce(
                func.sum(Loan.outstanding_amount),
                0,
            )
        )
        .filter(Loan.customer_id == Customer.id)
        .correlate(Customer)
        .scalar_subquery()
    )

    total_monthly_emi = (
        session.query(
            func.coalesce(
                func.sum(Loan.monthly_emi),
                0,
            )
        )
        .filter(
            Loan.customer_id == Customer.id,
            Loan.status == "ACTIVE",
        )
        .correlate(Customer)
        .scalar_subquery()
    )

    account_count = (
        session.query(func.count(Account.id))
        .filter(Account.customer_id == Customer.id)
        .correlate(Customer)
        .scalar_subquery()
    )

    active_loan_count = (
        session.query(func.count(Loan.id))
        .filter(
            Loan.customer_id == Customer.id,
            Loan.status == "ACTIVE",
        )
        .correlate(Customer)
        .scalar_subquery()
    )

    total_transactions = (
        session.query(func.count(Transaction.id))
        .join(
            Account,
            Account.id == Transaction.account_id,
        )
        .filter(Account.customer_id == Customer.id)
        .correlate(Customer)
        .scalar_subquery()
    )

    total_transaction_amount = (
        session.query(
            func.coalesce(
                func.sum(Transaction.amount),
                0,
            )
        )
        .join(
            Account,
            Account.id == Transaction.account_id,
        )
        .filter(Account.customer_id == Customer.id)
        .correlate(Customer)
        .scalar_subquery()
    )

    row = (
        session.query(
            Customer.id.label("customer_id"),
            Customer.customer_code,
            Customer.full_name,
            Customer.monthly_income,
            Customer.credit_score,
            Customer.risk_level,
            total_balance.label("total_balance"),
            total_loan_outstanding.label(
                "total_loan_outstanding"
            ),
            total_monthly_emi.label("total_monthly_emi"),
            account_count.label("account_count"),
            active_loan_count.label("active_loan_count"),
            total_transactions.label("total_transactions"),
            total_transaction_amount.label(
                "total_transaction_amount"
            ),
        )
        .filter(Customer.id == customer_id)
        .one_or_none()
    )

    if not row:
        return None

    summary = {
        "customer_id": row.customer_id,
        "customer_code": row.customer_code,
        "full_name": row.full_name,
        "monthly_income": row.monthly_income,
        "credit_score": row.credit_score,
        "risk_level": row.risk_level,
        "total_balance": row.total_balance,
        "total_loan_outstanding": row.total_loan_outstanding,
        "total_monthly_emi": row.total_monthly_emi,
        "account_count": row.account_count,
        "active_loan_count": row.active_loan_count,
        "total_transactions": row.total_transactions,
        "total_transaction_amount": row.total_transaction_amount,
    }

    monthly_income = summary["monthly_income"]
    monthly_emi = summary["total_monthly_emi"]

    if monthly_income and monthly_income > 0:
        dti = (
            Decimal(monthly_emi)
            / Decimal(monthly_income)
        ) * Decimal("100")
    else:
        dti = Decimal("0")

    summary["debt_to_income_ratio"] = dti.quantize(
        Decimal("0.01")
    )

    return summary