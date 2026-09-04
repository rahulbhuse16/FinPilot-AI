from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.api.routes.sse import sse_manager
from app.core.database import get_db
from app.models import ROLE_ADMIN, ROLE_CUSTOMER, User
from app.schemas.account import AccountResponse
from app.schemas.admin import (
    AccountCreateRequest,
    CustomerCreateRequest,
    CustomerUpdateRequest,
    UserCreateRequest,
)
from app.schemas.auth import UserResponse
from app.schemas.customer import CustomerResponse
from app.schemas.loan import LoanResponse, UpdateLoanRequest
from app.services.account_service import create_account
from app.services.customer_service import (
    create_customer,
    delete_customer,
    update_customer,
)
from app.services.loan_service import update_loan_status
from app.services.user_service import (
    create_user,
    get_customer_by_code,
    get_user_by_email,
)
from app.services.push_service import web_push_manager


router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    dependencies=[Depends(require_admin)],
)


# =========================================================
# CUSTOMERS
# =========================================================

@router.post(
    "/customers",
    response_model=CustomerResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_customer_route(
    payload: CustomerCreateRequest,
    db: Session = Depends(get_db),
):
    existing = get_customer_by_code(
        db,
        payload.customer_code,
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Customer code already exists",
        )

    return create_customer(
        db,
        payload.model_dump(),
    )


@router.patch(
    "/customers/{customer_id}",
    response_model=CustomerResponse,
)
def update_customer_route(
    customer_id: UUID,
    payload: CustomerUpdateRequest,
    db: Session = Depends(get_db),
):
    customer = update_customer(
        db,
        customer_id,
        payload.model_dump(exclude_none=True),
    )

    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found",
        )

    return customer


@router.delete(
    "/customers/{customer_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_customer_route(
    customer_id: UUID,
    db: Session = Depends(get_db),
):
    deleted = delete_customer(
        db,
        customer_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found",
        )


# =========================================================
# ACCOUNTS
# =========================================================

@router.post(
    "/customers/{customer_id}/accounts",
    response_model=AccountResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_account_route(
    customer_id: UUID,
    payload: AccountCreateRequest,
    db: Session = Depends(get_db),
):
    return create_account(
        db,
        customer_id,
        payload.model_dump(),
    )


# =========================================================
# USERS
# =========================================================

@router.get(
    "/users",
    response_model=list[UserResponse],
)
def list_users(
    db: Session = Depends(get_db),
):
    users = (
        db.query(User)
        .order_by(User.created_at.desc())
        .all()
    )

    return [
        UserResponse.model_validate(
            user,
            from_attributes=True,
        )
        for user in users
    ]


@router.post(
    "/users",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_user_route(
    payload: UserCreateRequest,
    db: Session = Depends(get_db),
):
    existing = get_user_by_email(
        db,
        payload.email,
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    customer_id = None

    if payload.role == ROLE_CUSTOMER:

        if not payload.customer_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="customer_code is required for customer users",
            )

        customer = get_customer_by_code(
            db,
            payload.customer_code,
        )

        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer code not found",
            )

        customer_id = customer.id

    user = create_user(
        db,
        email=payload.email,
        full_name=payload.full_name,
        password=payload.password,
        role=(
            ROLE_ADMIN
            if payload.role == ROLE_ADMIN
            else ROLE_CUSTOMER
        ),
        customer_id=customer_id,
    )

    return UserResponse.model_validate(
        user,
        from_attributes=True,
    )


# =========================================================
# LOANS
# =========================================================

@router.patch(
    "/loans/{loan_id}",
    response_model=LoanResponse,
)
async def update_loan(
    loan_id: UUID,
    payload: UpdateLoanRequest,
    db: Session = Depends(get_db),
):
    try:
        loan = update_loan_status(
            session=db,
            payload=payload
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan not found",
        )

    # -----------------------------------------------------
    # REAL-TIME CUSTOMER NOTIFICATION
    # -----------------------------------------------------
    print("🚨 ABOUT TO PUBLISH LOAN SSE")

    await sse_manager.publish(
        customer_id=str(loan.customer_id),
        event="loan.status_changed",
        data={
            "loan_id": str(loan.id),
            "status": loan.status,
        },
    )
    web_push_manager.publish(
    customer_id=str(loan.customer_id),
    title="Loan Approved",
    body="Your loan has been approved.",
    url="/loans",
)

    return loan

