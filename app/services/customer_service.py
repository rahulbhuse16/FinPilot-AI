from uuid import UUID
from psycopg.rows import dict_row


async def get_customer_by_id(connection, customer_id: UUID):

    async with connection.cursor(row_factory=dict_row) as cursor:
        await cursor.execute(
            """
            SELECT
                id,
                customer_code,
                full_name,
                email,
                phone,
                monthly_income,
                credit_score,
                risk_level
            FROM customers
            WHERE id = %s
            """,
            (customer_id,),
        )

        return await cursor.fetchone()


async def get_customers(
    connection,
    search: str | None = None,
    page: int = 1,
    page_size: int = 20,
):
    offset = (page - 1) * page_size

    search_pattern = f"%{search}%" if search else None

    async with connection.cursor(row_factory=dict_row) as cursor:

        # Count
        await cursor.execute(
            """
            SELECT COUNT(*)
            FROM customers
            WHERE (
                %s::text IS NULL
                OR full_name ILIKE %s
                OR email ILIKE %s
                OR customer_code ILIKE %s
            )
            """,
            (
                search_pattern,
                search_pattern,
                search_pattern,
                search_pattern,
            ),
        )

        total = (await cursor.fetchone())["count"]

        # Customers
        await cursor.execute(
            """
            SELECT
                id,
                customer_code,
                full_name,
                email,
                phone,
                monthly_income,
                credit_score,
                risk_level
            FROM customers
            WHERE (
                %s::text IS NULL
                OR full_name ILIKE %s
                OR email ILIKE %s
                OR customer_code ILIKE %s
            )
            ORDER BY full_name
            LIMIT %s
            OFFSET %s
            """,
            (
                search_pattern,
                search_pattern,
                search_pattern,
                search_pattern,
                page_size,
                offset,
            ),
        )

        items = await cursor.fetchall()

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size,
        }