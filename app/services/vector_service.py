from uuid import UUID

from sqlalchemy.orm import Session

from app.models import Document, DocumentChunk


def insert_chunks(
    session: Session,
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

    session.flush()


def similarity_search(
    session: Session,
    query_embedding: list[float],
    top_k: int,
) -> list[dict]:

    distance = DocumentChunk.embedding.cosine_distance(
        query_embedding
    )

    rows = (
        session.query(
            DocumentChunk.id,
            DocumentChunk.document_id,
            DocumentChunk.chunk_index,
            DocumentChunk.content,
            DocumentChunk.page_number,
            Document.file_name,
            (1 - distance).label("similarity"),
        )
        .join(
            Document,
            Document.id == DocumentChunk.document_id,
        )
        .filter(
            Document.status == "READY"
        )
        .order_by(distance)
        .limit(top_k)
        .all()
    )

    return [
        {
            "id": row.id,
            "document_id": row.document_id,
            "chunk_index": row.chunk_index,
            "content": row.content,
            "page_number": row.page_number,
            "file_name": row.file_name,
            "similarity": row.similarity,
        }
        for row in rows
    ]