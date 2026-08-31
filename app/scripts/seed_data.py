import asyncio
import selectors
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import SessionLocal, close_db, connect_db
from app.core.security import hash_password
from app.models import (
    ROLE_ADMIN,
    ROLE_CUSTOMER,
    Account,
    Customer,
    Loan,
    Transaction,
    User,
)


CUSTOMERS = [
    {
        "customer_code": "CUST-1001",
        "full_name": "Amit Sharma",
        "email": "amit@example.com",
        "phone": "9876543210",
        "monthly_income": 125000,
        "credit_score": 742,
        "risk_level": "LOW",
    },
    {
        "customer_code": "CUST-1002",
        "full_name": "Riya Patel",
        "email": "riya@example.com",
        "phone": "9876543211",
        "monthly_income": 85000,
        "credit_score": 681,
        "risk_level": "MEDIUM",
    },
    {
        "customer_code": "CUST-1003",
        "full_name": "Rahul Mehta",
        "email": "rahul@example.com",
        "phone": "9876543212",
        "monthly_income": 145000,
        "credit_score": 620,
        "risk_level": "HIGH",
    },
]


ACCOUNTS = [
    {
        "customer_code": "CUST-1001",
        "account_number": "ACC-10001",
        "account_type": "SAVINGS",
        "balance": 420000,
    },
    {
        "customer_code": "CUST-1001",
        "account_number": "ACC-10002",
        "account_type": "CURRENT",
        "balance": 180000,
    },
    {
        "customer_code": "CUST-1002",
        "account_number": "ACC-10003",
        "account_type": "SAVINGS",
        "balance": 125000,
    },
    {
        "customer_code": "CUST-1003",
        "account_number": "ACC-10004",
        "account_type": "SAVINGS",
        "balance": 95000,
    },
]


LOANS = [
    {
        "customer_code": "CUST-1001",
        "loan_type": "HOME_LOAN",
        "principal_amount": 3200000,
        "outstanding_amount": 2850000,
        "interest_rate": 8.5,
        "monthly_emi": 31000,
        "status": "ACTIVE",
    },
    {
        "customer_code": "CUST-1002",
        "loan_type": "PERSONAL_LOAN",
        "principal_amount": 500000,
        "outstanding_amount": 390000,
        "interest_rate": 12.5,
        "monthly_emi": 14500,
        "status": "ACTIVE",
    },
    {
        "customer_code": "CUST-1003",
        "loan_type": "HOME_LOAN",
        "principal_amount": 4500000,
        "outstanding_amount": 4100000,
        "interest_rate": 9.2,
        "monthly_emi": 42000,
        "status": "ACTIVE",
    },
    {
        "customer_code": "CUST-1003",
        "loan_type": "PERSONAL_LOAN",
        "principal_amount": 800000,
        "outstanding_amount": 720000,
        "interest_rate": 14.5,
        "monthly_emi": 21000,
        "status": "ACTIVE",
    },
]


USERS = [
    {
        "email": "admin@finpilot.ai",
        "full_name": "FinPilot Admin",
        "password": "Admin@12345",
        "role": ROLE_ADMIN,
        "customer_code": None,
    },
    {
        "email": "amit@example.com",
        "full_name": "Amit Sharma",
        "password": "Customer@12345",
        "role": ROLE_CUSTOMER,
        "customer_code": "CUST-1001",
    },
    {
        "email": "riya@example.com",
        "full_name": "Riya Patel",
        "password": "Customer@12345",
        "role": ROLE_CUSTOMER,
        "customer_code": "CUST-1002",
    },
    {
        "email": "rahul@example.com",
        "full_name": "Rahul Mehta",
        "password": "Customer@12345",
        "role": ROLE_CUSTOMER,
        "customer_code": "CUST-1003",
    },
]


def build_transactions(now: datetime) -> list[dict]:
    return [
        {
            "account_number": "ACC-10001",
            "amount": 45000,
            "transaction_type": "CREDIT",
            "category": "SALARY",
            "merchant": "ABC Technologies",
            "description": "Monthly salary",
            "transaction_time": now - timedelta(days=2),
        },
        {
            "account_number": "ACC-10001",
            "amount": 8500,
            "transaction_type": "DEBIT",
            "category": "RENT",
            "merchant": "City Homes",
            "description": "Monthly rent",
            "transaction_time": now - timedelta(days=5),
        },
        {
            "account_number": "ACC-10001",
            "amount": 3200,
            "transaction_type": "DEBIT",
            "category": "GROCERY",
            "merchant": "FreshMart",
            "description": "Grocery purchase",
            "transaction_time": now - timedelta(days=7),
        },
        {
            "account_number": "ACC-10002",
            "amount": 12500,
            "transaction_type": "DEBIT",
            "category": "TRAVEL",
            "merchant": "Air India",
            "description": "Flight booking",
            "transaction_time": now - timedelta(days=10),
        },
        {
            "account_number": "ACC-10003",
            "amount": 85000,
            "transaction_type": "CREDIT",
            "category": "SALARY",
            "merchant": "XYZ Solutions",
            "description": "Monthly salary",
            "transaction_time": now - timedelta(days=3),
        },
        {
            "account_number": "ACC-10003",
            "amount": 28000,
            "transaction_type": "DEBIT",
            "category": "RENT",
            "merchant": "Green Residency",
            "description": "Monthly rent",
            "transaction_time": now - timedelta(days=6),
        },
        {
            "account_number": "ACC-10004",
            "amount": 145000,
            "transaction_type": "CREDIT",
            "category": "SALARY",
            "merchant": "Tech Corp",
            "description": "Monthly salary",
            "transaction_time": now - timedelta(days=2),
        },
        {
            "account_number": "ACC-10004",
            "amount": 480000,
            "transaction_type": "DEBIT",
            "category": "TRANSFER",
            "merchant": "Unknown Beneficiary",
            "description": "High value transfer",
            "transaction_time": now - timedelta(days=1),
        },
    ]


async def seed_customers(session: AsyncSession) -> dict:

    await session.execute(
        insert(Customer)
        .values(CUSTOMERS)
        .on_conflict_do_nothing(index_elements=["customer_code"])
    )

    result = await session.execute(
        select(Customer.customer_code, Customer.id).order_by(
            Customer.customer_code
        )
    )

    return dict(result.all())


async def seed_accounts(
    session: AsyncSession,
    customer_map: dict,
) -> dict:

    await session.execute(
        insert(Account)
        .values(
            [
                {
                    "customer_id": customer_map[account["customer_code"]],
                    "account_number": account["account_number"],
                    "account_type": account["account_type"],
                    "balance": account["balance"],
                }
                for account in ACCOUNTS
            ]
        )
        .on_conflict_do_nothing(index_elements=["account_number"])
    )

    result = await session.execute(
        select(Account.account_number, Account.id)
    )

    return dict(result.all())


async def seed_loans(
    session: AsyncSession,
    customer_map: dict,
) -> None:

    session.add_all(
        [
            Loan(
                customer_id=customer_map[loan["customer_code"]],
                loan_type=loan["loan_type"],
                principal_amount=loan["principal_amount"],
                outstanding_amount=loan["outstanding_amount"],
                interest_rate=loan["interest_rate"],
                monthly_emi=loan["monthly_emi"],
                status=loan["status"],
            )
            for loan in LOANS
        ]
    )


async def seed_transactions(
    session: AsyncSession,
    account_map: dict,
) -> None:

    now = datetime.now(timezone.utc)

    session.add_all(
        [
            Transaction(
                account_id=account_map[transaction["account_number"]],
                amount=transaction["amount"],
                transaction_type=transaction["transaction_type"],
                category=transaction["category"],
                merchant=transaction["merchant"],
                description=transaction["description"],
                transaction_time=transaction["transaction_time"],
            )
            for transaction in build_transactions(now)
        ]
    )


async def seed_users(
    session: AsyncSession,
    customer_map: dict,
) -> None:

    await session.execute(
        insert(User)
        .values(
            [
                {
                    "email": user["email"],
                    "full_name": user["full_name"],
                    "password_hash": hash_password(user["password"]),
                    "role": user["role"],
                    "customer_id": (
                        customer_map[user["customer_code"]]
                        if user["customer_code"]
                        else None
                    ),
                }
                for user in USERS
            ]
        )
        .on_conflict_do_nothing(index_elements=["email"])
    )


async def seed() -> None:

    await connect_db()

    async with SessionLocal() as session:

        customer_map = await seed_customers(session)

        account_map = await seed_accounts(session, customer_map)

        await seed_loans(session, customer_map)

        await seed_transactions(session, account_map)

        await seed_users(session, customer_map)

        await session.commit()

    await close_db()


if __name__ == "__main__":
    loop = asyncio.SelectorEventLoop(selectors.SelectSelector())
    asyncio.set_event_loop(loop)

    try:
        loop.run_until_complete(seed())
    finally:
        loop.close()
