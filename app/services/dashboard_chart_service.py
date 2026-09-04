from datetime import datetime
from decimal import Decimal
from uuid import UUID

from sqlalchemy import case, func
from sqlalchemy.orm import Session

from app.models.account import Account
from app.models.loan import Loan
from app.models.transaction import Transaction
from app.schemas.dashboard import (
    BalanceTrendItem,
    CashFlowItem,
    DashboardStatisticsResponse,
    IncomeExpenseItem,
    LoanRepaymentResponse,
    SpendingCategoryItem,
)

# Number of trailing months surfaced in every time-series chart.
TREND_MONTHS = 6


def _month_expr():
    """Shared month-bucket expression so every query groups/orders consistently."""
    return func.date_trunc("month", Transaction.transaction_time)


def _format_month(value: datetime) -> str:
    """Render a truncated-month timestamp as the short label the API contract expects (e.g. 'Apr')."""
    return value.strftime("%b")


def get_dashboard_statistics(
    session: Session,
    customer_id: UUID,
) -> DashboardStatisticsResponse:

    balance_trend = get_balance_trend(
        session=session,
        customer_id=customer_id,
    )

    income_expense = get_income_expense(
        session=session,
        customer_id=customer_id,
    )

    spending_by_category = get_spending_by_category(
        session=session,
        customer_id=customer_id,
    )

    cash_flow = get_cash_flow(
        session=session,
        customer_id=customer_id,
    )

    loan_repayment = get_loan_repayment(
        session=session,
        customer_id=customer_id,
    )

    return DashboardStatisticsResponse(
        balance_trend=balance_trend,
        income_expense=income_expense,
        spending_by_category=spending_by_category,
        cash_flow=cash_flow,
        loan_repayment=loan_repayment,
    )


def get_balance_trend(
    session: Session,
    customer_id: UUID,
) -> list[BalanceTrendItem]:
    """
    Reconstruct the account balance at the end of each of the last N months.

    The previous implementation summed raw `Transaction.amount` values with no
    regard to CREDIT/DEBIT direction, which just produced "total money moved"
    per month, not a balance. Debits and credits were added together instead
    of netted, so the number wasn't a balance under any interpretation.

    This version nets each month's CREDIT/DEBIT flow, anchors to the
    customer's current total balance, and walks backward month-by-month to
    reconstruct what the balance was at the end of each prior month.
    """
    month_expr = _month_expr()

    net_change_expr = func.sum(
        case(
            (Transaction.transaction_type == "CREDIT", Transaction.amount),
            (Transaction.transaction_type == "DEBIT", -Transaction.amount),
            else_=0,
        )
    )

    # Order newest-first so LIMIT keeps the most recent months, not the
    # oldest ones (the original query ordered ascending before limiting,
    # which silently returned the earliest months in the account's history).
    rows = (
        session.query(
            month_expr.label("month"),
            net_change_expr.label("net_change"),
        )
        .join(Account, Account.id == Transaction.account_id)
        .filter(Account.customer_id == customer_id)
        .group_by(month_expr)
        .order_by(month_expr.desc())
        .limit(TREND_MONTHS)
        .all()
    )

    current_balance = (
        session.query(func.coalesce(func.sum(Account.balance), 0))
        .filter(Account.customer_id == customer_id)
        .scalar()
    )

    running_balance = Decimal(current_balance or 0)
    trend: list[BalanceTrendItem] = []

    for row in rows:
        trend.append(
            BalanceTrendItem(
                month=_format_month(row.month),
                balance=running_balance,
            )
        )
        running_balance -= Decimal(row.net_change or 0)

    # Rows were walked newest -> oldest; charts expect chronological order.
    trend.reverse()
    return trend


def get_income_expense(
    session: Session,
    customer_id: UUID,
) -> list[IncomeExpenseItem]:

    month_expr = _month_expr()

    rows = (
        session.query(
            month_expr.label("month"),
            func.sum(
                case(
                    (Transaction.transaction_type == "CREDIT", Transaction.amount),
                    else_=0,
                )
            ).label("income"),
            func.sum(
                case(
                    (Transaction.transaction_type == "DEBIT", Transaction.amount),
                    else_=0,
                )
            ).label("expense"),
        )
        .join(Account, Account.id == Transaction.account_id)
        .filter(Account.customer_id == customer_id)
        .group_by(month_expr)
        .order_by(month_expr.desc())
        .limit(TREND_MONTHS)
        .all()
    )

    items = [
        IncomeExpenseItem(
            month=_format_month(row.month),
            income=row.income or Decimal("0"),
            expense=row.expense or Decimal("0"),
        )
        for row in rows
    ]
    items.reverse()
    return items


def get_spending_by_category(
    session: Session,
    customer_id: UUID,
) -> list[SpendingCategoryItem]:

    rows = (
        session.query(
            Transaction.category.label("category"),
            func.sum(Transaction.amount).label("amount"),
        )
        .join(Account, Account.id == Transaction.account_id)
        .filter(
            Account.customer_id == customer_id,
            Transaction.transaction_type == "DEBIT",
        )
        .group_by(Transaction.category)
        .order_by(func.sum(Transaction.amount).desc())
        .all()
    )

    return [
        SpendingCategoryItem(
            category=row.category or "Other",
            amount=row.amount or Decimal("0"),
        )
        for row in rows
    ]


def get_cash_flow(
    session: Session,
    customer_id: UUID,
) -> list[CashFlowItem]:

    month_expr = _month_expr()

    rows = (
        session.query(
            month_expr.label("month"),
            func.sum(
                case(
                    (Transaction.transaction_type == "CREDIT", Transaction.amount),
                    else_=0,
                )
            ).label("credits"),
            func.sum(
                case(
                    (Transaction.transaction_type == "DEBIT", Transaction.amount),
                    else_=0,
                )
            ).label("debits"),
        )
        .join(Account, Account.id == Transaction.account_id)
        .filter(Account.customer_id == customer_id)
        .group_by(month_expr)
        .order_by(month_expr.desc())
        .limit(TREND_MONTHS)
        .all()
    )

    items = [
        CashFlowItem(
            month=_format_month(row.month),
            credits=row.credits or Decimal("0"),
            debits=row.debits or Decimal("0"),
        )
        for row in rows
    ]
    items.reverse()
    return items


def get_loan_repayment(
    session: Session,
    customer_id: UUID,
) -> LoanRepaymentResponse:
    """
    Summarize repayment progress across the customer's active loans.

    The previous implementation selected `sum(Loan.outstanding_amount)` for
    *both* "paid" and "remaining", so they were always equal and "paid" never
    reflected anything actually repaid. "Paid" is derived here as
    principal - outstanding, per loan, summed across active loans.
    """

    row = (
        session.query(
            func.coalesce(func.sum(Loan.principal_amount), 0).label("total_principal"),
            func.coalesce(func.sum(Loan.outstanding_amount), 0).label("total_outstanding"),
        )
        .filter(
            Loan.customer_id == customer_id,
            Loan.status == "ACTIVE",
        )
        .first()
    )

    total = Decimal(row.total_principal or 0)
    remaining = Decimal(row.total_outstanding or 0)
    paid = total - remaining

    percentage = (
        (paid / total * 100).quantize(Decimal("0.01"))
        if total > 0
        else Decimal("0")
    )

    return LoanRepaymentResponse(
        paid=paid,
        remaining=remaining,
        total=total,
        percentage=percentage,
    )