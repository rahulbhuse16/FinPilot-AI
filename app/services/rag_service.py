from app.core.config import settings
from app.services.embedding_service import generate_embeddings
from app.services.llm_service import llm
from app.services.prompts import RAG_PROMPT
from app.services.vector_service import similarity_search


async def answer_question(
    connection,
    question: str,
):

    # ----------------------------------
    # 1. Embed user question
    # ----------------------------------

    query_embedding = (
        await generate_embeddings(
            [question]
        )
    )[0]

    # ----------------------------------
    # 2. Retrieve relevant chunks
    # ----------------------------------

    chunks = await similarity_search(
        connection=connection,
        query_embedding=query_embedding,
        top_k=settings.rag_top_k,
    )

    if not chunks:

        return {
            "answer": (
                "I couldn't find relevant information "
                "in the financial knowledge base."
            ),
            "sources": [],
        }

    # ----------------------------------
    # 3. Build context
    # ----------------------------------

    context_parts = []

    for chunk in chunks:

        context_parts.append(
            f"""
Source: {chunk["file_name"]}
Page: {chunk["page_number"]}

{chunk["content"]}
"""
        )

    context = "\n\n---\n\n".join(
        context_parts
    )

    # ----------------------------------
    # 4. Build LangChain prompt
    # ----------------------------------

    messages = RAG_PROMPT.format_messages(
        context=context,
        question=question,
    )

    # ----------------------------------
    # 5. Generate answer
    # ----------------------------------

    response = await llm.ainvoke(
        messages
    )

    # ----------------------------------
    # 6. Return answer + citations
    # ----------------------------------

    sources = [
        {
            "document_id": str(
                chunk["document_id"]
            ),
            "file_name": chunk["file_name"],
            "page_number": chunk["page_number"],
            "chunk_index": chunk["chunk_index"],
        }
        for chunk in chunks
    ]

    return {
        "answer": response.content,
        "sources": sources,
    }