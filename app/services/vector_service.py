from uuid import UUID
from psycopg.rows import dict_row
from psycopg.types.json import Jsonb



def vector_to_pgvector(
    vector: list[float],
) -> str:
    return "[" + ",".join(
        str(value) for value in vector
    ) + "]"


async def insert_chunks(
    connection,
    document_id: UUID,
    chunks: list[dict],
    embeddings: list[list[float]],
):

    async with connection.cursor() as cursor:

        for chunk, embedding in zip(
            chunks,
            embeddings,
        ):

            vector = vector_to_pgvector(
                embedding
            )

            await cursor.execute(
                """
                INSERT INTO document_chunks (
                    document_id,
                    chunk_index,
                    content,
                    embedding,
                    page_number,
                    metadata
                )
                VALUES (
                    %s,
                    %s,
                    %s,
                    %s::vector,
                    %s,
                    %s
                )
                """,
                (
                    document_id,
                    chunk["chunk_index"],
                    chunk["content"],
                    vector,
                    chunk["page_number"],
                    Jsonb({
                        "source_type": "pdf",
                    }),
                ),
            )


async def similarity_search(
    connection,
    query_embedding: list[float],
    top_k: int,
):
    query_vector = vector_to_pgvector(
        query_embedding
    )

    async with connection.cursor(
        row_factory=dict_row
    ) as cursor:

        await cursor.execute(
            """
            SELECT
                dc.id,
                dc.document_id,
                dc.chunk_index,
                dc.content,
                dc.page_number,
                d.file_name,

                1 - (
                    dc.embedding <=> %s::vector
                ) AS similarity

            FROM document_chunks dc

            INNER JOIN documents d
                ON d.id = dc.document_id

            WHERE d.status = 'READY'

            ORDER BY
                dc.embedding <=> %s::vector

            LIMIT %s
            """,
            (
                query_vector,
                query_vector,
                top_k,
            ),
        )

        return await cursor.fetchall()