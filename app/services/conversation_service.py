from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Conversation, Message


async def create_conversation(
    session: AsyncSession,
    customer_id: UUID | None,
    title: str | None,
) -> dict:

    conversation = Conversation(
        customer_id=customer_id,
        title=title,
    )

    session.add(conversation)

    await session.flush()
    await session.refresh(conversation)

    return {
        "id": conversation.id,
        "customer_id": conversation.customer_id,
        "title": conversation.title,
        "created_at": conversation.created_at,
        "updated_at": conversation.updated_at,
    }


async def add_message(
    session: AsyncSession,
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

    await session.flush()
    await session.refresh(message)

    return {
        "id": message.id,
        "role": message.role,
        "content": message.content,
        "created_at": message.created_at,
    }


async def get_conversation_messages(
    session: AsyncSession,
    conversation_id: UUID,
    limit: int = 20,
) -> list[dict]:

    result = await session.execute(
        select(
            Message.id,
            Message.role,
            Message.content,
            Message.created_at,
        )
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())
        .limit(limit)
    )

    rows = [
        dict(row)
        for row in result.mappings().all()
    ]

    return list(reversed(rows))
