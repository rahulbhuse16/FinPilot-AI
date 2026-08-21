from datetime import datetime, timedelta

from app.core.database import get_db
from psycopg.rows import dict_row









async def _get_kpis(connection):

    async with connection.cursor(
        row_factory=dict_row
    ) as cursor:

        await cursor.execute(
            """
            SELECT
                (SELECT COUNT(*) FROM customers)
                    AS total_customers,

                (SELECT COUNT(*) FROM accounts)
                    AS total_accounts,

                (SELECT COUNT(*) FROM transactions)
                    AS total_transactions,

                (SELECT COUNT(*) FROM loans)
                    AS total_loans,

                (
                    SELECT COUNT(*)
                    FROM transactions t
                    WHERE t.amount >= (
                        SELECT COALESCE(
                            AVG(t2.amount) * 3,
                            0
                        )
                        FROM transactions t2
                    )
                ) AS anomaly_count,

                (
                    SELECT COUNT(*)
                    FROM documents
                ) AS documents_count
            """
        )

        return await cursor.fetchone()

async def _get_transaction_trend(
    connection,
):
    async with connection.cursor(
        row_factory=dict_row
    ) as cursor:

        await cursor.execute(
            """
            SELECT
                DATE(transaction_time) AS date,

                COALESCE(
                    SUM(
                        CASE
                            WHEN transaction_type = 'CREDIT'
                            THEN amount
                            ELSE 0
                        END
                    ),
                    0
                ) AS credits,

                COALESCE(
                    SUM(
                        CASE
                            WHEN transaction_type = 'DEBIT'
                            THEN amount
                            ELSE 0
                        END
                    ),
                    0
                ) AS debits,

                COUNT(*) AS transaction_count

            FROM transactions

            WHERE transaction_time >= CURRENT_DATE - INTERVAL '30 days'

            GROUP BY DATE(transaction_time)

            ORDER BY date ASC
            """
        )

        rows = await cursor.fetchall()

    return [
        {
            "date": row["date"].isoformat(),
            "credits": row["credits"],
            "debits": row["debits"],
            "transaction_count": row[
                "transaction_count"
            ],
        }
        for row in rows
    ]

async def _get_recent_transactions(connection):

    async with connection.cursor(
        row_factory=dict_row
    ) as cursor:

        await cursor.execute(
            """
            SELECT
                id,
                merchant,
                category,
                transaction_type,
                amount,
                transaction_time

            FROM transactions

            ORDER BY transaction_time DESC

            LIMIT 10
            """
        )

        rows = await cursor.fetchall()

    return [
        {
            **row,
            "id": str(row["id"]),
        }
        for row in rows
    ]

async def _get_anomalies(connection):

    async with connection.cursor(
        row_factory=dict_row
    ) as cursor:

        await cursor.execute(
            """
            WITH stats AS (
                SELECT
                    AVG(amount) AS avg_amount
                FROM transactions
            )

            SELECT
                t.id AS transaction_id,
                t.merchant,
                t.amount,
                t.transaction_time,

                CASE
                    WHEN t.amount >= s.avg_amount * 5
                    THEN 'Transaction is significantly above the overall average'

                    WHEN t.amount >= s.avg_amount * 3
                    THEN 'Transaction is significantly above the average'

                    ELSE 'Unusual transaction'
                END AS reason

            FROM transactions t
            CROSS JOIN stats s

            WHERE t.amount >= s.avg_amount * 3

            ORDER BY t.transaction_time DESC

            LIMIT 10
            """
        )

        rows = await cursor.fetchall()

    return [
        {
            **row,
            "transaction_id": str(row["transaction_id"]),
        }
        for row in rows
    ]


async def _get_customer_intelligence(connection):

    async with connection.cursor(
        row_factory=dict_row
    ) as cursor:

        await cursor.execute(
            """
            SELECT
                c.id AS customer_id,
                c.full_name AS customer_name,
                c.credit_score,

                COALESCE(
                    SUM(a.balance),
                    0
                ) AS total_balance,

                COALESCE(
                    SUM(l.outstanding_amount),
                    0
                ) AS loan_exposure,

                CASE
                    WHEN COALESCE(
                        SUM(l.outstanding_amount),
                        0
                    ) > 1000000
                    THEN 'HIGH'

                    WHEN COALESCE(
                        SUM(l.outstanding_amount),
                        0
                    ) > 500000
                    THEN 'MEDIUM'

                    ELSE 'LOW'
                END AS risk_level

            FROM customers c

            LEFT JOIN accounts a
                ON a.customer_id = c.id

            LEFT JOIN loans l
                ON l.customer_id = c.id

            GROUP BY
                c.id,
                c.full_name,
                c.credit_score

            ORDER BY loan_exposure DESC

            LIMIT 10
            """
        )

        rows = await cursor.fetchall()

    return [
        {
            **row,
            "customer_id": str(row["customer_id"]),
        }
        for row in rows
    ]

async def _get_rag_summary(
    connection,
):

    async with connection.cursor(
        row_factory=dict_row
    ) as cursor:

        await cursor.execute(
            """
            SELECT
                COUNT(*) AS total_documents,

                COUNT(
                    CASE
                        WHEN status = 'ready'
                        THEN 1
                    END
                ) AS ready_documents,

                COUNT(
                    CASE
                        WHEN status = 'processing'
                        THEN 1
                    END
                ) AS processing_documents,

                COUNT(
                    CASE
                        WHEN status = 'failed'
                        THEN 1
                    END
                ) AS failed_documents

            FROM documents
            """
        )

        return await cursor.fetchone()


async def get_dashboard_overview():

    async with get_db() as connection:

        kpis = await _get_kpis(connection)

        transaction_trend = (
            await _get_transaction_trend(
                connection
            )
        )

        recent_transactions = (
            await _get_recent_transactions(
                connection
            )
        )

        anomalies = await _get_anomalies(
            connection
        )

        customer_intelligence = (
            await _get_customer_intelligence(
                connection
            )
        )

        rag = await _get_rag_summary(
            connection
        )

    return {
        "kpis": kpis,
        "transaction_trend": transaction_trend,
        "recent_transactions": recent_transactions,
        "anomalies": anomalies,
        "customer_intelligence": customer_intelligence,
        "rag": rag,
    }