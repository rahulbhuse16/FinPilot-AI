from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_session, require_admin
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
from app.services.account_service import create_account
from app.services.customer_service import (
    create_customer,
    delete_customer,
    update_customer,
)
from app.services.user_service import (
    create_user,
    get_customer_by_code,
    get_user_by_email,
)


router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    dependencies=[Depends(require_admin)],
)


@router.post(
    "/customers",
    response_model=CustomerResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_customer_route(
    payload: CustomerCreateRequest,
    session: AsyncSession = Depends(get_session),
):
    existing = await get_customer_by_code(session, payload.customer_code)

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Customer code already exists",
        )

    customer = await create_customer(session, payload.model_dump())

    await session.commit()

    return customer


@router.patch(
    "/customers/{customer_id}",
    response_model=CustomerResponse,
)
async def update_customer_route(
    customer_id: UUID,
    payload: CustomerUpdateRequest,
    session: AsyncSession = Depends(get_session),
):
    customer = await update_customer(
        session,
        customer_id,
        payload.model_dump(exclude_none=True),
    )

    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found",
        )

    await session.commit()

    return customer


@router.delete(
    "/customers/{customer_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_customer_route(
    customer_id: UUID,
    session: AsyncSession = Depends(get_session),
):
    deleted = await delete_customer(session, customer_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found",
        )

    await session.commit()


@router.post(
    "/customers/{customer_id}/accounts",
    response_model=AccountResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_account_route(
    customer_id: UUID,
    payload: AccountCreateRequest,
    session: AsyncSession = Depends(get_session),
):
    account = await create_account(
        session,
        customer_id,
        payload.model_dump(),
    )

    await session.commit()

    return account


@router.get("/users", response_model=list[UserResponse])
async def list_users(
    session: AsyncSession = Depends(get_session),
):
    users = await session.scalars(
        select(User).order_by(User.created_at.desc())
    )

    return [
        UserResponse.model_validate(user, from_attributes=True)
        for user in users
    ]


@router.post(
    "/users",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_user_route(
    payload: UserCreateRequest,
    session: AsyncSession = Depends(get_session),
):
    existing = await get_user_by_email(session, payload.email)

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

        customer = await get_customer_by_code(session, payload.customer_code)

        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer code not found",
            )

        customer_id = customer.id

    user = await create_user(
        session,
        email=payload.email,
        full_name=payload.full_name,
        password=payload.password,
        role=ROLE_ADMIN if payload.role == ROLE_ADMIN else ROLE_CUSTOMER,
        customer_id=customer_id,
    )

    await session.commit()

    return UserResponse.model_validate(user, from_attributes=True)
