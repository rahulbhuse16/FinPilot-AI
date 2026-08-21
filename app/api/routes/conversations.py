from uuid import UUID

from fastapi import APIRouter

from app.core.database import get_db
from app.schemas.conversation import (
    ConversationResponse,
    CreateConversationRequest,
)
from app.services.conversation_service import (
    create_conversation,
)


router = APIRouter(
    prefix="/conversations",
    tags=["Conversations"],
)


@router.post(
    "",
    response_model=ConversationResponse,
)
async def create_new_conversation(
    request: CreateConversationRequest,
):

    async with get_db() as connection:

        conversation = await create_conversation(
            connection=connection,
            customer_id=request.customer_id,
            title=request.title,
        )

        await connection.commit()

    return conversation