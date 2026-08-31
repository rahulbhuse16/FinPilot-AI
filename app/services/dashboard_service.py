from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models import Account, Customer, Document, Loan, Transaction


def _count_of(model) -> int:
    return (
        select(func.count())
        .select_from(model)
        .scalar_subquery()
    )


async def _get_kpis(session: AsyncSession) -> dict:

    average_amount = (
        select(
            func.coalesce(func.avg(Transaction.amount) * 3, 0)
        )
        .select_from(Transaction)
        .scalar_subquery()
    )

    anomaly_count = (
        select(func.count())
        .select_from(Transaction)
        .where(Transaction.amount >= average_amount)
        .scalar_subquery()
    )

    result = await session.execute(
        select(
            _count_of(Customer).label("total_customers"),
            _count_of(Account).label("total_accounts"),
            _count_of(Transaction).label("total_transactions"),
            _count_of(Loan).label("total_loans"),
            anomaly_count.label("anomaly_count"),
            _count_of(Document).label("documents_count"),
        )
    )

    return dict(result.mappings().one())


async def _get_transaction_trend(
    session: AsyncSession,
) -> list[dict]:

    transaction_date = func.date(
        Transaction.transaction_time
    ).label("date")

    result = await session.execute(
        select(
            transaction_date,
            func.coalesce(
                func.sum(
                    case(
                        (
                            Transaction.transaction_type == "CREDIT",
                            Transaction.amount,
                        ),
                        else_=0,
                    )
                ),
                0,
            ).label("credits"),
            func.coalesce(
                func.sum(
                    case(
                        (
                            Transaction.transaction_type == "DEBIT",
                            Transaction.amount,
                        ),
                        else_=0,
                    )
                ),
                0,
            ).label("debits"),
            func.count().label("transaction_count"),
        )
        .where(
            Transaction.transaction_time
            >= func.current_date() - 30
        )
        .group_by(transaction_date)
        .order_by(transaction_date.asc())
    )

    return [
        {
            "date": row["date"].isoformat(),
            "credits": row["credits"],
            "debits": row["debits"],
            "transaction_count": row["transaction_count"],
        }
        for row in result.mappings().all()
    ]


async def _get_recent_transactions(
    session: AsyncSession,
) -> list[dict]:

    result = await session.execute(
        select(
            Transaction.id,
            Transaction.merchant,
            Transaction.category,
            Transaction.transaction_type,
            Transaction.amount,
            Transaction.transaction_time,
        )
        .order_by(Transaction.transaction_time.desc())
        .limit(10)
    )

    return [
        {
            **row,
            "id": str(row["id"]),
        }
        for row in result.mappings().all()
    ]


async def _get_anomalies(
    session: AsyncSession,
) -> list[dict]:

    average_amount = (
        select(func.avg(Transaction.amount))
        .select_from(Transaction)
        .scalar_subquery()
    )

    reason = case(
        (
            Transaction.amount >= average_amount * 5,
            "Transaction is significantly above the overall average",
        ),
        (
            Transaction.amount >= average_amount * 3,
            "Transaction is significantly above the average",
        ),
        else_="Unusual transaction",
    ).label("reason")

    result = await session.execute(
        select(
            Transaction.id.label("transaction_id"),
            Transaction.merchant,
            Transaction.amount,
            Transaction.transaction_time,
            reason,
        )
        .select_from(Transaction)
        .where(Transaction.amount >= average_amount * 3)
        .order_by(Transaction.transaction_time.desc())
        .limit(10)
    )

    return [
        {
            **row,
            "transaction_id": str(row["transaction_id"]),
        }
        for row in result.mappings().all()
    ]


async def _get_customer_intelligence(
    session: AsyncSession,
) -> list[dict]:

    loan_exposure = func.coalesce(
        func.sum(Loan.outstanding_amount),
        0,
    ).label("loan_exposure")

    risk_level = case(
        (
            func.coalesce(func.sum(Loan.outstanding_amount), 0)
            > 1000000,
            "HIGH",
        ),
        (
            func.coalesce(func.sum(Loan.outstanding_amount), 0)
            > 500000,
            "MEDIUM",
        ),
        else_="LOW",
    ).label("risk_level")

    result = await session.execute(
        select(
            Customer.id.label("customer_id"),
            Customer.full_name.label("customer_name"),
            Customer.credit_score,
            func.coalesce(
                func.sum(Account.balance),
                0,
            ).label("total_balance"),
            loan_exposure,
            risk_level,
        )
        .select_from(Customer)
        .outerjoin(Account, Account.customer_id == Customer.id)
        .outerjoin(Loan, Loan.customer_id == Customer.id)
        .group_by(
            Customer.id,
            Customer.full_name,
            Customer.credit_score,
        )
        .order_by(loan_exposure.desc())
        .limit(10)
    )

    return [
        {
            **row,
            "customer_id": str(row["customer_id"]),
        }
        for row in result.mappings().all()
    ]


async def _get_rag_summary(
    session: AsyncSession,
) -> dict:

    def _status_count(status: str):
        return func.count(
            case((Document.status == status, 1))
        )

    result = await session.execute(
        select(
            func.count().label("total_documents"),
            _status_count("ready").label("ready_documents"),
            _status_count("processing").label("processing_documents"),
            _status_count("failed").label("failed_documents"),
        ).select_from(Document)
    )

    return dict(result.mappings().one())


async def get_dashboard_overview() -> dict:

    async with get_db() as session:

        kpis = await _get_kpis(session)

        transaction_trend = await _get_transaction_trend(session)

        recent_transactions = await _get_recent_transactions(session)

        anomalies = await _get_anomalies(session)

        customer_intelligence = await _get_customer_intelligence(session)

        rag = await _get_rag_summary(session)

    return {
        "kpis": kpis,
        "transaction_trend": transaction_trend,
        "recent_transactions": recent_transactions,
        "anomalies": anomalies,
        "customer_intelligence": customer_intelligence,
        "rag": rag,
    }
