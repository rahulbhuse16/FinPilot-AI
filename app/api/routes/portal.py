from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_customer_id, get_session, require_customer
from app.core.security import hash_password, verify_password
from app.models import User
from app.schemas.account import AccountResponse
from app.schemas.customer import CustomerResponse
from app.schemas.customer_360 import Customer360Summary
from app.schemas.loan import LoanResponse
from app.schemas.portal import PasswordChangeRequest, ProfileUpdateRequest
from app.schemas.transaction import TransactionResponse
from app.services.account_service import get_accounts_by_customer
from app.services.anomaly_service import detect_transaction_anomalies
from app.services.customer_360_service import get_customer_360
from app.services.customer_service import get_customer_by_id, update_customer
from app.services.loan_service import get_customer_loans
from app.services.transaction_service import get_customer_transactions


router = APIRouter(
    prefix="/portal",
    tags=["Customer Portal"],
)


@router.get("/profile", response_model=CustomerResponse)
async def profile(
    customer_id: UUID = Depends(get_current_customer_id),
    session: AsyncSession = Depends(get_session),
):
    customer = await get_customer_by_id(session, customer_id)

    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found",
        )

    return customer


@router.patch("/profile", response_model=CustomerResponse)
async def update_profile(
    payload: ProfileUpdateRequest,
    customer_id: UUID = Depends(get_current_customer_id),
    session: AsyncSession = Depends(get_session),
):
    updates = payload.model_dump(exclude_none=True)

    customer = await update_customer(session, customer_id, updates)

    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found",
        )

    await session.commit()

    return customer


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    payload: PasswordChangeRequest,
    user: User = Depends(require_customer),
    session: AsyncSession = Depends(get_session),
):
    if not verify_password(payload.current_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    db_user = await session.get(User, user.id)
    db_user.password_hash = hash_password(payload.new_password)

    await session.commit()


@router.get("/summary", response_model=Customer360Summary)
async def summary(
    customer_id: UUID = Depends(get_current_customer_id),
    session: AsyncSession = Depends(get_session),
):
    result = await get_customer_360(session, customer_id)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found",
        )

    return result


@router.get("/accounts", response_model=list[AccountResponse])
async def accounts(
    customer_id: UUID = Depends(get_current_customer_id),
    session: AsyncSession = Depends(get_session),
):
    return await get_accounts_by_customer(session, customer_id)


@router.get("/transactions", response_model=list[TransactionResponse])
async def transactions(
    limit: int = Query(default=50, ge=1, le=200),
    customer_id: UUID = Depends(get_current_customer_id),
    session: AsyncSession = Depends(get_session),
):
    return await get_customer_transactions(session, customer_id, limit)


@router.get("/loans", response_model=list[LoanResponse])
async def loans(
    customer_id: UUID = Depends(get_current_customer_id),
    session: AsyncSession = Depends(get_session),
):
    return await get_customer_loans(session, customer_id)


@router.get("/transaction-anomalies")
async def transaction_anomalies(
    customer_id: UUID = Depends(get_current_customer_id),
    session: AsyncSession = Depends(get_session),
):
    return await detect_transaction_anomalies(session, customer_id)
