from decimal import Decimal
from uuid import UUID

from psycopg.rows import dict_row


async def get_customer_360(
    connection,
    customer_id: UUID,
):
    async with connection.cursor(row_factory=dict_row) as cursor:

        await cursor.execute(
            """
            SELECT
                c.id AS customer_id,
                c.customer_code,
                c.full_name,
                c.monthly_income,
                c.credit_score,
                c.risk_level,

                COALESCE(
                    (
                        SELECT SUM(a.balance)
                        FROM accounts a
                        WHERE a.customer_id = c.id
                    ),
                    0
                ) AS total_balance,

                COALESCE(
                    (
                        SELECT SUM(l.outstanding_amount)
                        FROM loans l
                        WHERE l.customer_id = c.id
                    ),
                    0
                ) AS total_loan_outstanding,

                COALESCE(
                    (
                        SELECT SUM(l.monthly_emi)
                        FROM loans l
                        WHERE l.customer_id = c.id
                        AND l.status = 'ACTIVE'
                    ),
                    0
                ) AS total_monthly_emi,

                (
                    SELECT COUNT(*)
                    FROM accounts a
                    WHERE a.customer_id = c.id
                ) AS account_count,

                (
                    SELECT COUNT(*)
                    FROM loans l
                    WHERE l.customer_id = c.id
                    AND l.status = 'ACTIVE'
                ) AS active_loan_count,

                (
                    SELECT COUNT(*)
                    FROM transactions t
                    INNER JOIN accounts a
                        ON a.id = t.account_id
                    WHERE a.customer_id = c.id
                ) AS total_transactions,

                COALESCE(
                    (
                        SELECT SUM(t.amount)
                        FROM transactions t
                        INNER JOIN accounts a
                            ON a.id = t.account_id
                        WHERE a.customer_id = c.id
                    ),
                    0
                ) AS total_transaction_amount

            FROM customers c

            WHERE c.id = %s
            """,
            (customer_id,),
        )

        result = await cursor.fetchone()
        

    if not result:
        return None

    monthly_income = result["monthly_income"]
    monthly_emi = result["total_monthly_emi"]

    if monthly_income and monthly_income > 0:
        dti = (
            monthly_emi / monthly_income
        ) * Decimal("100")
    else:
        dti = Decimal("0")

    result["debt_to_income_ratio"] = dti.quantize(
        Decimal("0.01")
    )

    return result