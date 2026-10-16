
from typing import Any

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.services.chunking_service import create_chunks
from app.services.document_service import (
    calculate_file_hash,
    create_document,
    update_document_status,
)
from app.services.embedding_service import generate_embeddings
from app.services.pdf_service import extract_pdf_pages
from app.services.vector_service import insert_chunks


MAX_FILE_SIZE = 10 * 1024 * 1024


async def process_salary_slip_for_rag(
    *,
    file_content: bytes,
    file_name: str,
    content_type: str,
    db: Session,
) -> dict[str, Any]:
    """Ingest a salary slip into the RAG document store."""

    if content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Salary slip must be a PDF.",
        )

    if not file_content:
        raise HTTPException(
            status_code=400,
            detail="Salary slip file is empty.",
        )

    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Salary slip must be less than 10 MB.",
        )

    # 1. Calculate document hash
    content_hash = calculate_file_hash(file_content)

    # 2. Extract PDF pages
    pages = extract_pdf_pages(file_content)

    if not pages:
        raise HTTPException(
            status_code=422,
            detail="Could not extract text from salary slip.",
        )

    # 3. Split text into chunks
    chunks = create_chunks(pages)

    if not chunks:
        raise HTTPException(
            status_code=422,
            detail="No text chunks generated from salary slip.",
        )

    texts = [chunk["content"] for chunk in chunks]

    # 4. Generate embeddings
    embeddings = await generate_embeddings(texts)

    if len(embeddings) != len(chunks):
        raise HTTPException(
            status_code=500,
            detail="Embedding count does not match chunk count.",
        )

    # 5. Store document and vectors
    try:
        # Assumes these helpers do not commit internally.
        with db.begin():
            document = create_document(
                session=db,
                file_name=file_name,
                content_type=content_type,
                file_size=len(file_content),
                content_hash=content_hash,
            )

            insert_chunks(
                session=db,
                document_id=document["id"],
                chunks=chunks,
                embeddings=embeddings,
            )

            update_document_status(
                session=db,
                document_id=document["id"],
                status="READY",
                chunk_count=len(chunks),
            )

        document["status"] = "READY"
        document["chunk_count"] = len(chunks)

        return document

    except Exception:
        # The transaction rolls back if a database write fails.
        raise
