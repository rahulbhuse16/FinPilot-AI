from typing import Callable
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models import ROLE_ADMIN, ROLE_CUSTOMER, User
from app.services.user_service import get_user_by_id


bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(
        bearer_scheme
    ),
    session: Session = Depends(get_db),
) -> User:

    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise unauthorized

    payload = decode_access_token(
        credentials.credentials
    )

    if not payload or not payload.get("sub"):
        raise unauthorized

    try:
        user_id = UUID(payload["sub"])
    except (ValueError, TypeError):
        raise unauthorized

    user = get_user_by_id(
        session,
        user_id,
    )

    if not user or not user.is_active:
        raise unauthorized

    return user


def require_roles(*roles: str) -> Callable:

    def dependency(
        user: User = Depends(get_current_user),
    ) -> User:

        if user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )

        return user

    return dependency


require_admin = require_roles(ROLE_ADMIN)

require_customer = require_roles(ROLE_CUSTOMER)


def get_current_customer_id(
    user: User = Depends(require_customer),
) -> UUID:

    if user.customer_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not linked to a customer profile",
        )

    return user.customer_id