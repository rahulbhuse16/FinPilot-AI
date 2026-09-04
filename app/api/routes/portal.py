from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import (
    get_current_customer_id,
    require_customer,
)
from app.core.database import get_db
from app.core.security import hash_password, verify_password
from app.models import User
from app.models.account import Account
from app.schemas.account import AccountResponse
from app.schemas.admin import AccountCreateRequest
from app.schemas.customer import CustomerResponse
from app.schemas.customer_360 import Customer360Summary
from app.schemas.dashboard import DashboardStatisticsResponse
from app.schemas.loan import (
    LoanCreateRequest,
    LoanPaymentRequest,
    LoanPaymentResponse,
    LoanResponse,
)
from app.schemas.portal import (
    PasswordChangeRequest,
    ProfileUpdateRequest,
)
from app.schemas.transaction import TransactionCreateRequest, TransactionResponse
from app.services.account_service import get_accounts_by_customer,create_account
from app.services.anomaly_service import detect_transaction_anomalies
from app.services.customer_360_service import get_customer_360
from app.services.customer_service import (
    get_customer_by_id,
    update_customer,
)
from app.services.dashboard_chart_service import get_dashboard_statistics
from app.services.loan_eligibilty_service import checkLoanEligigtibiltyForAmountByAI
from app.services.loan_service import (
    create_loan_payment,
    create_loan_request,
    get_customer_loans,
)
from app.services.transaction_service import get_customer_transactions,create_transaction
from app.services.sse_service import sse_manager
from app.services.push_service import web_push_manager


router = APIRouter(
    prefix="/portal",
    tags=["Customer Portal"],
)


@router.get(
    "/profile",
    response_model=CustomerResponse,
)
def profile(
    customer_id: UUID = Depends(get_current_customer_id),
    db: Session = Depends(get_db),
):
    customer = get_customer_by_id(
        db,
        customer_id,
    )

    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found",
        )

    return customer


@router.patch(
    "/profile",
    response_model=CustomerResponse,
)
def update_profile(
    payload: ProfileUpdateRequest,
    customer_id: UUID = Depends(get_current_customer_id),
    db: Session = Depends(get_db),
):
    updates = payload.model_dump(
        exclude_none=True
    )

    customer = update_customer(
        db,
        customer_id,
        updates,
    )

    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found",
        )

    return customer


@router.post(
    "/change-password",
    status_code=status.HTTP_204_NO_CONTENT,
)
def change_password(
    payload: PasswordChangeRequest,
    user: User = Depends(require_customer),
    db: Session = Depends(get_db),
):
    if not verify_password(
        payload.current_password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    db_user = db.get(User, user.id)

    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    db_user.password_hash = hash_password(
        payload.new_password
    )


@router.get(
    "/summary",
    response_model=Customer360Summary,
)
def summary(
    customer_id: UUID = Depends(get_current_customer_id),
    db: Session = Depends(get_db),
):
    result = get_customer_360(
        db,
        customer_id,
    )

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found",
        )

    return result



@router.post(
    "/accounts",
    status_code=status.HTTP_201_CREATED,
)
def create_customer_account(
    payload: AccountCreateRequest,
    customer_id: UUID = Depends(get_current_customer_id),
    db: Session = Depends(get_db),
):
    return create_account(
        session=db,
        customer_id=customer_id,
        values=payload.model_dump(),
    )

@router.get(
    "/accounts",
    response_model=list[AccountResponse]
)
def account(
    customer_id: UUID = Depends(get_current_customer_id),
    db: Session = Depends(get_db),
):
    return get_accounts_by_customer(
        
        session=db,
        customer_id=customer_id,
        
    )


@router.get(
    "/transactions",
    response_model=list[TransactionResponse],
)
def transactions(
    limit: int = Query(
        default=50,
        ge=1,
        le=200,
    ),
    customer_id: UUID = Depends(get_current_customer_id),
    db: Session = Depends(get_db),
):
    return get_customer_transactions(
        db,
        customer_id,
        limit,
    )


@router.get(
    "/loans",
    response_model=list[LoanResponse],
)
def loans(
    customer_id: UUID = Depends(get_current_customer_id),
    db: Session = Depends(get_db),
):
    return get_customer_loans(
        db,
        customer_id,
    )


@router.get(
    "/loans/{loan_id}",
    response_model=LoanResponse,
)
def loan_detail(
    loan_id: UUID,
    customer_id: UUID = Depends(get_current_customer_id),
    db: Session = Depends(get_db),
):
    loan = get_customer_loans(
        db,
        customer_id,
    )

    for item in loan:
        if item["id"] == loan_id:
            return item

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Loan not found",
    )


@router.post(
    "/loans/{loan_id}/payments",
    response_model=LoanPaymentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_payment(
    loan_id: UUID,
    payload: LoanPaymentRequest,
    customer_id: UUID = Depends(get_current_customer_id),
    db: Session = Depends(get_db),
):
    try:
        loan = create_loan_payment(
            session=db,
            customer_id=customer_id,
            loan_id=loan_id,
            amount=payload.amount,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan not found",
        )

    return loan


@router.get(
    "/transaction-anomalies",
)
def transaction_anomalies(
    customer_id: UUID = Depends(get_current_customer_id),
    db: Session = Depends(get_db),
):
    return detect_transaction_anomalies(
        db,
        customer_id,
    )


@router.post(
    "/loans",
    response_model=LoanResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_loan(
    payload_json: str = Form(...),
    salary_slip: UploadFile = File(...),
    customer_id: UUID = Depends(get_current_customer_id),
    session: Session = Depends(get_db),
):
    payload = LoanCreateRequest.model_validate_json(
        payload_json
    )

    eligibility = await checkLoanEligigtibiltyForAmountByAI(
        salary_slip=salary_slip,
        loan_amount=payload.principal_amount,
    )

    if not eligibility["eligible"]:
        raise HTTPException(
            status_code=422,
            detail=eligibility["reason"],
        )

    loan_values = payload.model_dump()

    loan_values["salary_slip_url"] = (
        eligibility["salary_slip_url"]
    )

    loan = create_loan_request(
        session=session,
        customer_id=customer_id,
        values=loan_values,
    )

    await sse_manager.publish(
        customer_id=str(customer_id),
        event="loan.created",
        data={
            "loan_id": str(loan.id),
            "customer_id": str(customer_id),
            "loan_type": loan.loan_type,
            "principal_amount": str(
                loan.principal_amount
            ),
            "status": loan.status,
        },
    )

    web_push_manager.publish(
        customer_id=str(loan.customer_id),
        title="Loan Application Submitted",
        body="Your loan application has been submitted successfully.",
        url="/loans",
    )

    return loan


@router.post(
    "/transaction",
    response_model=TransactionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_transaction_request(
    payload: TransactionCreateRequest,
    customer_id: UUID = Depends(get_current_customer_id),
    session: Session = Depends(get_db),
):
    account = (
        session.query(Account)
        .filter(
            Account.id == payload.account_id,
            Account.customer_id == customer_id,
        )
        .with_for_update()
        .first()
    )

    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found",
        )

    if account.balance < payload.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient balance. Please add balance to the account.",
        )

    try:
        account.balance -= payload.amount
        

        transaction = create_transaction(
            session=session,
            values=payload.model_dump(),
        )

        session.commit()
        session.refresh(transaction)

        return transaction

    except Exception:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create transaction.",
        )
@router.get(
    "/dashboard/statistics",
    response_model=DashboardStatisticsResponse,
)
def dashboard_statistics(
    customer_id: UUID = Depends(
        get_current_customer_id
    ),
    db: Session = Depends(get_db),
):
    return get_dashboard_statistics(
        session=db,
        customer_id=customer_id,
    )

