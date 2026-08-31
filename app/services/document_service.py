import hashlib
from uuid import UUID

from sqlalchemy import func, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Document


def calculate_file_hash(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()


async def create_document(
    session: AsyncSession,
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

    await session.flush()
    await session.refresh(document)

    return {
        "id": document.id,
        "file_name": document.file_name,
        "content_type": document.content_type,
        "file_size": document.file_size,
        "status": document.status,
        "chunk_count": document.chunk_count,
        "created_at": document.created_at,
    }


async def update_document_status(
    session: AsyncSession,
    document_id: UUID,
    status: str,
    chunk_count: int,
) -> None:

    await session.execute(
        update(Document)
        .where(Document.id == document_id)
        .values(
            status=status,
            chunk_count=chunk_count,
            updated_at=func.now(),
        )
    )
