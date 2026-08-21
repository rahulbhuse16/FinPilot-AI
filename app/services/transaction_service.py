from uuid import UUID

from psycopg.rows import dict_row


async def get_customer_transactions(
    connection,
    customer_id: UUID,
    limit: int = 50,
):
    async with connection.cursor(row_factory=dict_row) as cursor:

        await cursor.execute(
            """
            SELECT
                t.id,
                t.account_id,
                t.amount,
                t.transaction_type,
                t.category,
                t.merchant,
                t.description,
                t.transaction_time
            FROM transactions t
            INNER JOIN accounts a
                ON a.id = t.account_id
            WHERE a.customer_id = %s
            ORDER BY t.transaction_time DESC
            LIMIT %s
            """,
            (customer_id, limit),
        )

        return await cursor.fetchall()