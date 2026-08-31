from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_session
from app.core.security import create_access_token
from app.models import ROLE_CUSTOMER, User
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from app.services.user_service import (
    authenticate_user,
    create_customer_profile,
    create_user,
    get_customer_by_code,
    get_user_by_email,
    has_user_for_customer,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


def _token_response(user: User) -> TokenResponse:
    token = create_access_token(
        subject=str(user.id),
        role=user.role,
        customer_id=str(user.customer_id) if user.customer_id else None,
    )

    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user, from_attributes=True),
    )


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(
    payload: RegisterRequest,
    session: AsyncSession = Depends(get_session),
):
    existing = await get_user_by_email(session, payload.email)

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    if payload.customer_code:
        customer = await get_customer_by_code(
            session,
            payload.customer_code,
        )

        if not customer or customer.email.lower() != payload.email.lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    "No customer profile matches that code and email. "
                    "Contact support to link your account."
                ),
            )

        if await has_user_for_customer(session, customer.id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This customer profile already has a login",
            )
    else:
        customer = await create_customer_profile(
            session,
            full_name=payload.full_name,
            email=payload.email,
        )

    user = await create_user(
        session,
        email=payload.email,
        full_name=payload.full_name,
        password=payload.password,
        role=ROLE_CUSTOMER,
        customer_id=customer.id,
    )

    await session.commit()

    return _token_response(user)


@router.post("/login", response_model=TokenResponse)
async def login(
    payload: LoginRequest,
    session: AsyncSession = Depends(get_session),
):
    user = await authenticate_user(
        session,
        email=payload.email,
        password=payload.password,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    return _token_response(user)


@router.get("/me", response_model=UserResponse)
async def me(user: User = Depends(get_current_user)):
    return UserResponse.model_validate(user, from_attributes=True)
