from uuid import UUID

from psycopg.rows import dict_row


async def create_conversation(
    connection,
    customer_id: UUID | None,
    title: str | None,
):
    async with connection.cursor(
        row_factory=dict_row
    ) as cursor:

        await cursor.execute(
            """
            INSERT INTO conversations (
                customer_id,
                title
            )
            VALUES (%s, %s)
            RETURNING
                id,
                customer_id,
                title,
                created_at,
                updated_at
            """,
            (
                customer_id,
                title,
            ),
        )

        return await cursor.fetchone()


async def add_message(
    connection,
    conversation_id: UUID,
    role: str,
    content: str,
):
    async with connection.cursor(
        row_factory=dict_row
    ) as cursor:

        await cursor.execute(
            """
            INSERT INTO messages (
                conversation_id,
                role,
                content
            )
            VALUES (%s, %s, %s)
            RETURNING
                id,
                role,
                content,
                created_at
            """,
            (
                conversation_id,
                role,
                content,
            ),
        )

        return await cursor.fetchone()


async def get_conversation_messages(
    connection,
    conversation_id: UUID,
    limit: int = 20,
):
    async with connection.cursor(
        row_factory=dict_row
    ) as cursor:

        await cursor.execute(
            """
            SELECT
                id,
                role,
                content,
                created_at
            FROM messages
            WHERE conversation_id = %s
            ORDER BY created_at DESC
            LIMIT %s
            """,
            (
                conversation_id,
                limit,
            ),
        )

        rows = await cursor.fetchall()

    return list(reversed(rows))