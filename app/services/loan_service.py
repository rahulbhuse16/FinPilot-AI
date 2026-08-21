from uuid import UUID

from psycopg.rows import dict_row


async def get_customer_loans(
    connection,
    customer_id: UUID,
):
    async with connection.cursor(row_factory=dict_row) as cursor:

        await cursor.execute(
            """
            SELECT
                id,
                loan_type,
                principal_amount,
                outstanding_amount,
                interest_rate,
                monthly_emi,
                status
            FROM loans
            WHERE customer_id = %s
            ORDER BY created_at DESC
            """,
            (customer_id,),
        )

        return await cursor.fetchall()