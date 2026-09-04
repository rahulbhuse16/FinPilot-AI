from uuid import UUID

from sqlalchemy.orm import Session

from app.models.conversation import Conversation,Message



def create_conversation(
    session: Session,
    customer_id: UUID | None,
    title: str | None,
) -> dict:

    conversation = Conversation(
        customer_id=customer_id,
        title=title,
    )

    session.add(conversation)

    session.commit()
    session.refresh(conversation)

    return {
        "id": conversation.id,
        "customer_id": conversation.customer_id,
        "title": conversation.title,
        "created_at": conversation.created_at,
        "updated_at": conversation.updated_at,
    }


def add_message(
    session: Session,
    conversation_id: UUID,
    role: str,
    content: str,
) -> dict:

    message = Message(
        conversation_id=conversation_id,
        role=role,
        content=content,
    )

    session.add(message)

    session.flush()
    session.refresh(message)

    return {
        "id": message.id,
        "role": message.role,
        "content": message.content,
        "created_at": message.created_at,
    }


def get_conversation_messages(
    session: Session,
    conversation_id: UUID,
    limit: int = 20,
) -> list[dict]:

    messages = (
        session.query(
            Message.id,
            Message.role,
            Message.content,
            Message.created_at,
        )
        .filter(
            Message.conversation_id == conversation_id
        )
        .order_by(
            Message.created_at.desc()
        )
        .limit(limit)
        .all()
    )

    rows = [
        {
            "id": message.id,
            "role": message.role,
            "content": message.content,
            "created_at": message.created_at,
        }
        for message in messages
    ]

    return list(reversed(rows))