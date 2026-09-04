import hashlib
from uuid import UUID

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import Document


def calculate_file_hash(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()


def create_document(
    session: Session,
    file_name: str,
    content_type: str,
    file_size: int,
    content_hash: str,
) -> dict:

    document = Document(
        file_name=file_name,
        content_type=content_type,
        file_size=file_size,
        content_hash=content_hash,
        status="PROCESSING",
    )

    session.add(document)

    session.flush()
    session.refresh(document)

    return {
        "id": document.id,
        "file_name": document.file_name,
        "content_type": document.content_type,
        "file_size": document.file_size,
        "status": document.status,
        "chunk_count": document.chunk_count,
        "created_at": document.created_at,
    }


def update_document_status(
    session: Session,
    document_id: UUID,
    status: str,
    chunk_count: int,
) -> None:

    (
        session.query(Document)
        .filter(Document.id == document_id)
        .update(
            {
                Document.status: status,
                Document.chunk_count: chunk_count,
                Document.updated_at: func.now(),
            },
            synchronize_session=False,
        )
    )

    session.flush()