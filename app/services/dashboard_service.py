from sqlalchemy import case, func
from sqlalchemy.orm import Session

from app.models import (
    Account,
    Customer,
    Document,
    Loan,
    Transaction,
)


def _count_of(model):
    return (
        Session.query(model)
        .count()
    )


def _get_kpis(session: Session) -> dict:

    average_amount = (
        session.query(
            func.coalesce(
                func.avg(Transaction.amount) * 3,
                0,
            )
        )
        .scalar_subquery()
    )

    anomaly_count = (
        session.query(func.count(Transaction.id))
        .filter(
            Transaction.amount >= average_amount
        )
        .scalar_subquery()
    )

    total_customers = (
        session.query(func.count(Customer.id))
        .scalar_subquery()
    )

    total_accounts = (
        session.query(func.count(Account.id))
        .scalar_subquery()
    )

    total_transactions = (
        session.query(func.count(Transaction.id))
        .scalar_subquery()
    )

    total_loans = (
        session.query(func.count(Loan.id))
        .scalar_subquery()
    )

    documents_count = (
        session.query(func.count(Document.id))
        .scalar_subquery()
    )

    row = (
        session.query(
            total_customers.label("total_customers"),
            total_accounts.label("total_accounts"),
            total_transactions.label("total_transactions"),
            total_loans.label("total_loans"),
            anomaly_count.label("anomaly_count"),
            documents_count.label("documents_count"),
        )
        .one()
    )

    return {
        "total_customers": row.total_customers,
        "total_accounts": row.total_accounts,
        "total_transactions": row.total_transactions,
        "total_loans": row.total_loans,
        "anomaly_count": row.anomaly_count,
        "documents_count": row.documents_count,
    }


def _get_transaction_trend(
    session: Session,
) -> list[dict]:

    transaction_date = func.date(
        Transaction.transaction_time
    ).label("date")

    rows = (
        session.query(
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
        .filter(
            Transaction.transaction_time
            >= func.current_date() - 30
        )
        .group_by(transaction_date)
        .order_by(transaction_date.asc())
        .all()
    )

    return [
        {
            "date": row.date.isoformat(),
            "credits": row.credits,
            "debits": row.debits,
            "transaction_count": row.transaction_count,
        }
        for row in rows
    ]


def _get_recent_transactions(
    session: Session,
) -> list[dict]:

    rows = (
        session.query(
            Transaction.id,
            Transaction.merchant,
            Transaction.category,
            Transaction.transaction_type,
            Transaction.amount,
            Transaction.transaction_time,
        )
        .order_by(
            Transaction.transaction_time.desc()
        )
        .limit(10)
        .all()
    )

    return [
        {
            "id": str(row.id),
            "merchant": row.merchant,
            "category": row.category,
            "transaction_type": row.transaction_type,
            "amount": row.amount,
            "transaction_time": row.transaction_time,
        }
        for row in rows
    ]


def _get_anomalies(
    session: Session,
) -> list[dict]:

    average_amount = (
        session.query(
            func.avg(Transaction.amount)
        )
        .scalar_subquery()
    )

    reason = case(
        (
            Transaction.amount
            >= average_amount * 5,
            "Transaction is significantly above the overall average",
        ),
        (
            Transaction.amount
            >= average_amount * 3,
            "Transaction is significantly above the average",
        ),
        else_="Unusual transaction",
    ).label("reason")

    rows = (
        session.query(
            Transaction.id.label("transaction_id"),
            Transaction.merchant,
            Transaction.amount,
            Transaction.transaction_time,
            reason,
        )
        .filter(
            Transaction.amount
            >= average_amount * 3
        )
        .order_by(
            Transaction.transaction_time.desc()
        )
        .limit(10)
        .all()
    )

    return [
        {
            "transaction_id": str(row.transaction_id),
            "merchant": row.merchant,
            "amount": row.amount,
            "transaction_time": row.transaction_time,
            "reason": row.reason,
        }
        for row in rows
    ]


def _get_customer_intelligence(
    session: Session,
) -> list[dict]:

    loan_exposure = func.coalesce(
        func.sum(Loan.outstanding_amount),
        0,
    ).label("loan_exposure")

    risk_level = case(
        (
            func.coalesce(
                func.sum(Loan.outstanding_amount),
                0,
            )
            > 1000000,
            "HIGH",
        ),
        (
            func.coalesce(
                func.sum(Loan.outstanding_amount),
                0,
            )
            > 500000,
            "MEDIUM",
        ),
        else_="LOW",
    ).label("risk_level")

    rows = (
        session.query(
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
        .outerjoin(
            Account,
            Account.customer_id == Customer.id,
        )
        .outerjoin(
            Loan,
            Loan.customer_id == Customer.id,
        )
        .group_by(
            Customer.id,
            Customer.full_name,
            Customer.credit_score,
        )
        .order_by(
            loan_exposure.desc()
        )
        .limit(10)
        .all()
    )

    return [
        {
            "customer_id": str(row.customer_id),
            "customer_name": row.customer_name,
            "credit_score": row.credit_score,
            "total_balance": row.total_balance,
            "loan_exposure": row.loan_exposure,
            "risk_level": row.risk_level,
        }
        for row in rows
    ]


def _get_rag_summary(
    session: Session,
) -> dict:

    def _status_count(status: str):
        return func.count(
            case(
                (
                    Document.status == status,
                    1,
                )
            )
        )

    row = (
        session.query(
            func.count().label("total_documents"),
            _status_count("READY").label(
                "ready_documents"
            ),
            _status_count("PROCESSING").label(
                "processing_documents"
            ),
            _status_count("FAILED").label(
                "failed_documents"
            ),
        )
        .select_from(Document)
        .one()
    )

    return {
        "total_documents": row.total_documents,
        "ready_documents": row.ready_documents,
        "processing_documents": row.processing_documents,
        "failed_documents": row.failed_documents,
    }


def get_dashboard_overview(
    session: Session,
) -> dict:

    return {
        "kpis": _get_kpis(session),
        "transaction_trend": _get_transaction_trend(session),
        "recent_transactions": _get_recent_transactions(session),
        "anomalies": _get_anomalies(session),
        "customer_intelligence": _get_customer_intelligence(session),
        "rag": _get_rag_summary(session),
    }