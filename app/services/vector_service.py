from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Document, DocumentChunk


async def insert_chunks(
    session: AsyncSession,
    document_id: UUID,
    chunks: list[dict],
    embeddings: list[list[float]],
) -> None:

    session.add_all(
        [
            DocumentChunk(
                document_id=document_id,
                chunk_index=chunk["chunk_index"],
                content=chunk["content"],
                embedding=embedding,
                page_number=chunk["page_number"],
                metadata_={
                    "source_type": "pdf",
                },
            )
            for chunk, embedding in zip(chunks, embeddings)
        ]
    )

    await session.flush()


async def similarity_search(
    session: AsyncSession,
    query_embedding: list[float],
    top_k: int,
) -> list[dict]:

    distance = DocumentChunk.embedding.cosine_distance(
        query_embedding
    )

    result = await session.execute(
        select(
            DocumentChunk.id,
            DocumentChunk.document_id,
            DocumentChunk.chunk_index,
            DocumentChunk.content,
            DocumentChunk.page_number,
            Document.file_name,
            (1 - distance).label("similarity"),
        )
        .join(Document, Document.id == DocumentChunk.document_id)
        .where(Document.status == "READY")
        .order_by(distance)
        .limit(top_k)
    )

    return [
        dict(row)
        for row in result.mappings().all()
    ]
