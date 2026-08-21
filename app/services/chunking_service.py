from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.core.config import settings


def create_chunks(pages: list[dict]) -> list[dict]:

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.rag_chunk_size,
        chunk_overlap=settings.rag_chunk_overlap,
        separators=[
            "\n\n",
            "\n",
            ". ",
            " ",
            "",
        ],
    )

    chunks = []

    chunk_index = 0

    for page in pages:

        page_chunks = splitter.split_text(
            page["content"]
        )

        for content in page_chunks:

            chunks.append(
                {
                    "chunk_index": chunk_index,
                    "content": content,
                    "page_number": page["page_number"],
                }
            )

            chunk_index += 1

    return chunks