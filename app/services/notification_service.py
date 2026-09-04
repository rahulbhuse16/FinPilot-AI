from uuid import UUID

from sqlalchemy.orm import Session

from app.models.notification import Notification
from app.models.user import ROLE_ADMIN, User
from app.schemas.notification import (
    NotificationListResponse,
    NotificationResponse,
)


def create_notification(
    session: Session,
    user_id: UUID,
    notification_type: str,
    title: str,
    message: str,
) -> NotificationResponse:

    notification = Notification(
        user_id=user_id,
        notification_type=notification_type,
        title=title,
        message=message,
    )

    session.add(notification)
    session.flush()
    session.refresh(notification)

    return NotificationResponse.model_validate(notification)


def get_notifications(
    session: Session,
    user: User,
    limit: int = 20,
) -> NotificationListResponse:

    query = session.query(Notification)

    if user.role == ROLE_ADMIN:
        # Admin gets all LOAN_REQUEST notifications
        query = query.filter(
            Notification.notification_type == "LOAN_REQUEST"
        )
    else:
        # Customer gets only their own notifications
        query = query.filter(
            Notification.user_id == user.id
        )

    notifications = (
        query
        .order_by(Notification.created_at.desc())
        .limit(limit)
        .all()
    )

    unread_query = session.query(Notification).filter(
        Notification.is_read.is_(False)
    )

    if user.role == ROLE_ADMIN:
        unread_query = unread_query.filter(
            Notification.notification_type == "LOAN_REQUEST"
        )
    else:
        unread_query = unread_query.filter(
            Notification.user_id == user.id
        )

    unread_count = unread_query.count()

    return NotificationListResponse(
        notifications=[
            NotificationResponse.model_validate(notification)
            for notification in notifications
        ],
        unread_count=unread_count,
    )

def mark_notification_as_read(
    session: Session,
    user_id: UUID,
    notification_id: UUID,
) -> NotificationResponse | None:

    notification = (
        session.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == user_id,
        )
        .first()
    )

    if not notification:
        return None

    notification.is_read = True

    session.commit()
    session.refresh(notification)

    return NotificationResponse.model_validate(notification)


def mark_all_notifications_as_read(
    session: Session,
    user_id: UUID,
) -> int:

    updated_count = (
        session.query(Notification)
        .filter(
            Notification.user_id == user_id,
            Notification.is_read.is_(False),
        )
        .update(
            {
                Notification.is_read: True,
            },
            synchronize_session=False,
        )
    )

    session.commit()

    return updated_count