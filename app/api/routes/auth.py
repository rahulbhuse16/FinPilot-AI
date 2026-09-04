from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.security import create_access_token
from app.models import ROLE_CUSTOMER, User,ROLE_ADMIN
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


def _token_response(
    user: User,
    response: Response,
) -> TokenResponse:

    token = create_access_token(
        subject=str(user.id),
        role=user.role,
        customer_id=(
            str(user.customer_id)
            if user.customer_id
            else None
        ),
    )

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=60 * 60,
    )

    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(
            user,
            from_attributes=True,
        ),
    )


# ---------------------------------------------------------
# Register
# ---------------------------------------------------------

@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    payload: RegisterRequest,
    response: Response,
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

    if payload.customer_code:

        customer = get_customer_by_code(
            db,
            payload.customer_code,
        )

        if (
            not customer
            or customer.email.lower()
            != payload.email.lower()
        ):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    "No customer profile matches that code and email. "
                    "Contact support to link your account."
                ),
            )

        if has_user_for_customer(
            db,
            customer.id,
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This customer profile already has a login",
            )

    else:

        customer = create_customer_profile(
            db,
            full_name=payload.full_name,
            email=payload.email,
        )

    user = create_user(
        db,
        email=payload.email,
        full_name=payload.full_name,
        password=payload.password,
        role=ROLE_CUSTOMER,
        customer_id=customer.id,
    )

    db.commit()

    return _token_response(
        user,
        response,
    )


# ---------------------------------------------------------
# Login
# ---------------------------------------------------------

@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    payload: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
):

    user = authenticate_user(
        db,
        email=payload.email,
        password=payload.password,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    return _token_response(
        user,
        response,
    )


# ---------------------------------------------------------
# Current user
# ---------------------------------------------------------

@router.get(
    "/me",
    response_model=UserResponse,
)
def me(
    user: User = Depends(get_current_user),
):

    return UserResponse.model_validate(
        user,
        from_attributes=True,
    )

