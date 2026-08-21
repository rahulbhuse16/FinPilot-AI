import hashlib
from uuid import UUID

from psycopg.rows import dict_row


def calculate_file_hash(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()


async def create_document(
    connection,
    file_name: str,
    content_type: str,
    file_size: int,
    content_hash: str,
):
    async with connection.cursor(row_factory=dict_row) as cursor:

        await cursor.execute(
            """
            INSERT INTO documents (
                file_name,
                content_type,
                file_size,
                content_hash,
                status
            )
            VALUES (%s, %s, %s, %s, 'PROCESSING')
            RETURNING
                id,
                file_name,
                content_type,
                file_size,
                status,
                chunk_count,
                created_at
            """,
            (
                file_name,
                content_type,
                file_size,
                content_hash,
            ),
        )

        return await cursor.fetchone()


async def update_document_status(
    connection,
    document_id: UUID,
    status: str,
    chunk_count: int,
):
    await connection.execute(
        """
        UPDATE documents
        SET
            status = %s,
            chunk_count = %s,
            updated_at = NOW()
        WHERE id = %s
        """,
        (
            status,
            chunk_count,
            document_id,
        ),
    )