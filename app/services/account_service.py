from uuid import UUID

from psycopg.rows import dict_row


async def get_accounts_by_customer(
    connection,
    customer_id: UUID,
):
    async with connection.cursor(row_factory=dict_row) as cursor:

        await cursor.execute(
            """
            SELECT
                id,
                account_number,
                account_type,
                balance,
                currency,
                status
            FROM accounts
            WHERE customer_id = %s
            ORDER BY created_at DESC
            """,
            (customer_id,),
        )

        return await cursor.fetchall()