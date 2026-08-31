from decimal import Decimal
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Account, Customer, Loan, Transaction


async def get_customer_360(
    session: AsyncSession,
    customer_id: UUID,
) -> dict | None:

    total_balance = (
        select(func.coalesce(func.sum(Account.balance), 0))
        .where(Account.customer_id == Customer.id)
        .scalar_subquery()
    )

    total_loan_outstanding = (
        select(func.coalesce(func.sum(Loan.outstanding_amount), 0))
        .where(Loan.customer_id == Customer.id)
        .scalar_subquery()
    )

    total_monthly_emi = (
        select(func.coalesce(func.sum(Loan.monthly_emi), 0))
        .where(
            Loan.customer_id == Customer.id,
            Loan.status == "ACTIVE",
        )
        .scalar_subquery()
    )

    account_count = (
        select(func.count())
        .select_from(Account)
        .where(Account.customer_id == Customer.id)
        .scalar_subquery()
    )

    active_loan_count = (
        select(func.count())
        .select_from(Loan)
        .where(
            Loan.customer_id == Customer.id,
            Loan.status == "ACTIVE",
        )
        .scalar_subquery()
    )

    total_transactions = (
        select(func.count())
        .select_from(Transaction)
        .join(Account, Account.id == Transaction.account_id)
        .where(Account.customer_id == Customer.id)
        .scalar_subquery()
    )

    total_transaction_amount = (
        select(func.coalesce(func.sum(Transaction.amount), 0))
        .select_from(Transaction)
        .join(Account, Account.id == Transaction.account_id)
        .where(Account.customer_id == Customer.id)
        .scalar_subquery()
    )

    result = await session.execute(
        select(
            Customer.id.label("customer_id"),
            Customer.customer_code,
            Customer.full_name,
            Customer.monthly_income,
            Customer.credit_score,
            Customer.risk_level,
            total_balance.label("total_balance"),
            total_loan_outstanding.label("total_loan_outstanding"),
            total_monthly_emi.label("total_monthly_emi"),
            account_count.label("account_count"),
            active_loan_count.label("active_loan_count"),
            total_transactions.label("total_transactions"),
            total_transaction_amount.label("total_transaction_amount"),
        ).where(Customer.id == customer_id)
    )

    row = result.mappings().one_or_none()

    if not row:
        return None

    summary = dict(row)

    monthly_income = summary["monthly_income"]
    monthly_emi = summary["total_monthly_emi"]

    if monthly_income and monthly_income > 0:
        dti = (
            Decimal(monthly_emi) / Decimal(monthly_income)
        ) * Decimal("100")
    else:
        dti = Decimal("0")

    summary["debt_to_income_ratio"] = dti.quantize(
        Decimal("0.01")
    )

    return summary
