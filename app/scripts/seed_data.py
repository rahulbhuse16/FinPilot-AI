import asyncio
import selectors
from datetime import datetime, timedelta, timezone
from app.core.database import connect_db, close_db, pool


async def seed():

    await connect_db()

    async with pool.connection() as connection:

        async with connection.cursor() as cursor:

            # -------------------------
            # Customers
            # -------------------------

            customers = [
                (
                    "CUST-1001",
                    "Amit Sharma",
                    "amit@example.com",
                    "9876543210",
                    125000,
                    742,
                    "LOW",
                ),
                (
                    "CUST-1002",
                    "Riya Patel",
                    "riya@example.com",
                    "9876543211",
                    85000,
                    681,
                    "MEDIUM",
                ),
                (
                    "CUST-1003",
                    "Rahul Mehta",
                    "rahul@example.com",
                    "9876543212",
                    145000,
                    620,
                    "HIGH",
                ),
            ]

            for customer in customers:

                await cursor.execute(
                    """
                    INSERT INTO customers (
                        customer_code,
                        full_name,
                        email,
                        phone,
                        monthly_income,
                        credit_score,
                        risk_level
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s)

                    ON CONFLICT (customer_code)
                    DO NOTHING
                    """,
                    customer,
                )

            # -------------------------
            # Get customer IDs
            # -------------------------

            await cursor.execute(
                """
                SELECT id, customer_code
                FROM customers
                ORDER BY customer_code
                """
            )

            customer_rows = await cursor.fetchall()

            customer_map = {
                row[1]: row[0]
                for row in customer_rows
            }

            # -------------------------
            # Accounts
            # -------------------------

            accounts = [
                (
                    customer_map["CUST-1001"],
                    "ACC-10001",
                    "SAVINGS",
                    420000,
                ),
                (
                    customer_map["CUST-1001"],
                    "ACC-10002",
                    "CURRENT",
                    180000,
                ),
                (
                    customer_map["CUST-1002"],
                    "ACC-10003",
                    "SAVINGS",
                    125000,
                ),
                (
                    customer_map["CUST-1003"],
                    "ACC-10004",
                    "SAVINGS",
                    95000,
                ),
            ]

            for account in accounts:

                await cursor.execute(
                    """
                    INSERT INTO accounts (
                        customer_id,
                        account_number,
                        account_type,
                        balance
                    )
                    VALUES (%s, %s, %s, %s)

                    ON CONFLICT (account_number)
                    DO NOTHING
                    """,
                    account,
                )

            # -------------------------
            # Loans
            # -------------------------

            loans = [
                (
                    customer_map["CUST-1001"],
                    "HOME_LOAN",
                    3200000,
                    2850000,
                    8.5,
                    31000,
                    "ACTIVE",
                ),
                (
                    customer_map["CUST-1002"],
                    "PERSONAL_LOAN",
                    500000,
                    390000,
                    12.5,
                    14500,
                    "ACTIVE",
                ),
                (
                    customer_map["CUST-1003"],
                    "HOME_LOAN",
                    4500000,
                    4100000,
                    9.2,
                    42000,
                    "ACTIVE",
                ),
                (
                    customer_map["CUST-1003"],
                    "PERSONAL_LOAN",
                    800000,
                    720000,
                    14.5,
                    21000,
                    "ACTIVE",
                ),
            ]

            for loan in loans:

                await cursor.execute(
                    """
                    INSERT INTO loans (
                        customer_id,
                        loan_type,
                        principal_amount,
                        outstanding_amount,
                        interest_rate,
                        monthly_emi,
                        status
                    )
                    VALUES (
                        %s, %s, %s, %s,
                        %s, %s, %s
                    )
                    """,
                    loan,
                )

            # -------------------------
            # Transactions
            # -------------------------

            await cursor.execute(
                """
                SELECT id, account_number
                FROM accounts
                """
            )

            account_rows = await cursor.fetchall()

            account_map = {
                row[1]: row[0]
                for row in account_rows
            }

            now = datetime.now(timezone.utc)

            transactions = [

                (
                    account_map["ACC-10001"],
                    45000,
                    "CREDIT",
                    "SALARY",
                    "ABC Technologies",
                    "Monthly salary",
                    now - timedelta(days=2),
                ),

                (
                    account_map["ACC-10001"],
                    8500,
                    "DEBIT",
                    "RENT",
                    "City Homes",
                    "Monthly rent",
                    now - timedelta(days=5),
                ),

                (
                    account_map["ACC-10001"],
                    3200,
                    "DEBIT",
                    "GROCERY",
                    "FreshMart",
                    "Grocery purchase",
                    now - timedelta(days=7),
                ),

                (
                    account_map["ACC-10002"],
                    12500,
                    "DEBIT",
                    "TRAVEL",
                    "Air India",
                    "Flight booking",
                    now - timedelta(days=10),
                ),

                (
                    account_map["ACC-10003"],
                    85000,
                    "CREDIT",
                    "SALARY",
                    "XYZ Solutions",
                    "Monthly salary",
                    now - timedelta(days=3),
                ),

                (
                    account_map["ACC-10003"],
                    28000,
                    "DEBIT",
                    "RENT",
                    "Green Residency",
                    "Monthly rent",
                    now - timedelta(days=6),
                ),

                (
                    account_map["ACC-10004"],
                    145000,
                    "CREDIT",
                    "SALARY",
                    "Tech Corp",
                    "Monthly salary",
                    now - timedelta(days=2),
                ),

                (
                    account_map["ACC-10004"],
                    480000,
                    "DEBIT",
                    "TRANSFER",
                    "Unknown Beneficiary",
                    "High value transfer",
                    now - timedelta(days=1),
                ),
            ]

            for transaction in transactions:

                await cursor.execute(
                    """
                    INSERT INTO transactions (
                        account_id,
                        amount,
                        transaction_type,
                        category,
                        merchant,
                        description,
                        transaction_time
                    )
                    VALUES (
                        %s, %s, %s, %s,
                        %s, %s, %s
                    )
                    """,
                    transaction,
                )

        await connection.commit()

    await close_db()



if __name__ == "__main__":
    loop = asyncio.SelectorEventLoop(selectors.SelectSelector())
    asyncio.set_event_loop(loop)

    try:
        loop.run_until_complete(seed())
    finally:
        loop.close()