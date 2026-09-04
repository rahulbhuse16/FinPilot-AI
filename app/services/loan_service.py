from decimal import Decimal
from uuid import UUID

from sqlalchemy.orm import Session

from app.models import Loan
from app.models.user import ROLE_ADMIN, User
from app.schemas.loan import (UpdateLoanRequest)
from sqlalchemy import select

from app.services.notification_service import create_notification



def get_customer_loans(
    session: Session,
    customer_id: UUID,
) -> list[dict]:

    loans = (
        session.query(
            Loan.id,
            Loan.loan_type,
            Loan.principal_amount,
            Loan.outstanding_amount,
            Loan.interest_rate,
            Loan.monthly_emi,
            Loan.status,
            Loan.salary_slip_url
        )
        .filter(
            Loan.customer_id == customer_id
        )
        .order_by(
            Loan.created_at.desc()
        )
        .all()
    )

    return [
        {
            "id": loan.id,
            "loan_type": loan.loan_type,
            "principal_amount": loan.principal_amount,
            "outstanding_amount": loan.outstanding_amount,
            "interest_rate": loan.interest_rate,
            "monthly_emi": loan.monthly_emi,
            "status": loan.status,
            "salary_slip_url":loan.salary_slip_url
        }
        for loan in loans
    ]


from uuid import UUID

from sqlalchemy.orm import Session

from app.models import Loan


def create_loan_request(
    session: Session,
    customer_id: UUID,
    values: dict,
) -> Loan:

    existing_loan = session.scalar(
        select(Loan).where(
            Loan.customer_id == customer_id,
            Loan.status == "PENDING",
        )
    )

    if existing_loan:
        raise ValueError(
            "You already have a pending loan request."
        )

    loan = Loan(
        customer_id=customer_id,
        loan_type=values["loan_type"],
        principal_amount=values["principal_amount"],
        outstanding_amount=values["principal_amount"],
        interest_rate=values["interest_rate"],
        monthly_emi=values["monthly_emi"],
        status="PENDING",
        salary_slip_url=values.get("salary_slip_url"),
    )

    session.add(loan)
    session.flush()

    # Get the single admin
    admin = (
        session.query(User)
        .filter(User.role == ROLE_ADMIN)
        .first()
    )

    if not admin:
        raise ValueError("Admin user not found.")

    create_notification(
        session=session,
        user_id=admin.id,
        notification_type="LOAN_REQUEST",
        title="New Loan Request",
        message=(
            f"Customer {customer_id} submitted a "
            f"{loan.loan_type} loan request for "
            f"₹{loan.principal_amount:,.2f}. "
            f"Interest rate: {loan.interest_rate}%. "
            f"Status: {loan.status}."
        ),
    )

    session.commit()
    session.refresh(loan)

    return loan



def create_loan_payment(
    session: Session,
    customer_id: UUID,
    loan_id: UUID,
    amount: Decimal,
) -> dict | None:
    """
    Applies a payment to the customer's loan.

    - Verifies the loan exists and belongs to the authenticated customer.
    - Rejects payments that would exceed the outstanding balance.
    - Marks the loan CLOSED when the balance reaches zero.

    Returns a dict of the refreshed loan row plus `amount_paid`,
    or `None` when the loan is not found.
    """

    loan = (
        session.query(Loan)
        .filter(
            Loan.id == loan_id,
            Loan.customer_id == customer_id,
        )
        .first()
    )

    if not loan:
        return None

    if loan.outstanding_amount <= 0:
        raise ValueError("Loan is already fully paid")

    if amount > loan.outstanding_amount:
        raise ValueError(
            "Payment cannot exceed the remaining balance"
        )

    loan.outstanding_amount = (
        loan.outstanding_amount - amount
    )

    if loan.outstanding_amount <= 0:
        loan.outstanding_amount = Decimal("0.00")
        loan.status = "CLOSED"

   

    session.commit()
    session.refresh(loan)

    return {
        "id": loan.id,
        "loan_type": loan.loan_type,
        "principal_amount": loan.principal_amount,
        "outstanding_amount": loan.outstanding_amount,
        "interest_rate": loan.interest_rate,
        "monthly_emi": loan.monthly_emi,
        "status": loan.status,
        "amount_paid": amount,
    }


def update_loan_status(
    session: Session,
    payload: UpdateLoanRequest,
) -> Loan | None:

    if payload.status not in {"ACTIVE", "REJECTED"}:
        raise ValueError(
            "Invalid loan status"
        )

    loan = (
        session.query(Loan)
        .filter(
            Loan.id == payload.loan_id
        )
        .first()
    )

    if not loan:
        return None

    if loan.status != "PENDING":
        raise ValueError(
            "Only pending loans can be approved or rejected"
        )

    loan.status = payload.status

    # Find customer user
    user = session.scalar(
        select(User).where(
            User.customer_id == loan.customer_id
        )
    )

    if user:

        if payload.status == "ACTIVE":
            notification_type = "LOAN_APPROVED"
            title = "Loan approved"

            message = (
                f"Your loan Id {loan.id} request "
                "has been approved."
            )

        else:
            notification_type = "LOAN_REJECTED"
            title = "Loan request rejected"

            message = (
                f"Your loan Id {loan.id} request "
                "has been rejected."
            )

        create_notification(
            session=session,
            user_id=user.id,
            notification_type=notification_type,
            title=title,
            message=message,
        )

    session.commit()
    session.refresh(loan)

    return loan

