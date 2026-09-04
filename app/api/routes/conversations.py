from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

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
def create_new_conversation(
    request: CreateConversationRequest,
    db: Session = Depends(get_db),
):
    conversation = create_conversation(
        session=db,
        customer_id=request.customer_id,
        title=request.title,
    )

    return conversation