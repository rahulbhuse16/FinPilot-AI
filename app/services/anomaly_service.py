from decimal import Decimal
from uuid import UUID

from psycopg.rows import dict_row


async def detect_transaction_anomalies(
    connection,
    customer_id: str,
    limit: int = 50,
):
    async with connection.cursor(
        row_factory=dict_row
    ) as cursor:

        await cursor.execute(
            """
            SELECT
                t.id,
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
            (
                customer_id,
                limit,
            ),
        )

        transactions = await cursor.fetchall()

    if not transactions:
        return []

    amounts = [
        Decimal(str(t["amount"]))
        for t in transactions
    ]

    average_amount = (
        sum(amounts) / len(amounts)
    )

    anomalies = []

    for transaction in transactions:

        amount = Decimal(
            str(transaction["amount"])
        )

        reasons = []

        # --------------------------------
        # Large transaction
        # --------------------------------

        if (
            average_amount > 0
            and amount
            >= average_amount * Decimal("3")
        ):
            reasons.append(
                "transaction is significantly "
                "larger than the customer's "
                "recent average"
            )

        # --------------------------------
        # High-value transfer
        # --------------------------------

        if (
            transaction["transaction_type"]
            == "DEBIT"
            and amount >= Decimal("100000")
        ):
            reasons.append(
                "high-value debit transaction"
            )

        if reasons:

            anomalies.append(
                {
                    "transaction_id": str(
                        transaction["id"]
                    ),
                    "amount": str(amount),
                    "merchant": transaction[
                        "merchant"
                    ],
                    "category": transaction[
                        "category"
                    ],
                    "transaction_time": (
                        transaction[
                            "transaction_time"
                        ].isoformat()
                    ),
                    "reasons": reasons,
                }
            )

    return anomalies