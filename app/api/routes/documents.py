from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.document import DocumentResponse
from app.services.chunking_service import create_chunks
from app.services.document_service import (
    calculate_file_hash,
    create_document,
    update_document_status,
)
from app.services.embedding_service import generate_embeddings
from app.services.pdf_service import extract_pdf_pages
from app.services.vector_service import insert_chunks


router = APIRouter(
    prefix="/knowledge",
    tags=["Knowledge Base"],
)


MAX_FILE_SIZE = 10 * 1024 * 1024


@router.post(
    "/documents",
    response_model=DocumentResponse,
)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported.",
        )

    content = await file.read()

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size cannot exceed 10 MB.",
        )

    content_hash = calculate_file_hash(content)

    pages = extract_pdf_pages(content)

    if not pages:
        raise HTTPException(
            status_code=400,
            detail="Could not extract text from PDF.",
        )

    chunks = create_chunks(pages)

    texts = [
        chunk["content"]
        for chunk in chunks
    ]

    # Async external API
    embeddings = await generate_embeddings(texts)

    # Sync database operations
    document = create_document(
        session=db,
        file_name=file.filename or "unknown.pdf",
        content_type=file.content_type,
        file_size=len(content),
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