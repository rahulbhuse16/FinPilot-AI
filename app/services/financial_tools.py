from uuid import UUID

from langchain_core.tools import tool
from app.services.embedding_service import (
    generate_embeddings,
)
from sqlalchemy.orm import Session

from app.services.vector_service import (
    similarity_search,
)


def build_financial_tools(session: Session):

    @tool
    async def get_customer_360(
        customer_id: str,
    ) -> dict:
        """
        Get a customer's overall financial profile.

        Use this when the user asks about:
        - financial health
        - balances
        - loans
        - EMI
        - credit score
        - debt-to-income ratio
        - overall customer profile
        """

        from app.services.customer_360_service import (
            get_customer_360 as fetch_customer_360,
        )

        result = fetch_customer_360(
            session,
            UUID(customer_id),
        )

        if not result:
            return {
                "error": "Customer not found"
            }

        return {
            key: (
                str(value)
                if value is not None
                else None
            )
            for key, value in result.items()
        }

    @tool
    async def get_customer_transactions(
        customer_id: str,
        limit: int = 20,
    ) -> list[dict]:
        """
        Get recent transactions for a customer.

        Use this when the user asks about:
        - spending
        - recent transactions
        - merchants
        - categories
        - unusual transactions
        - transaction patterns
        """

        from app.services.transaction_service import (
            get_customer_transactions as fetch_transactions,
        )

        transactions = fetch_transactions(
            session,
            UUID(customer_id),
            limit,
        )

        return [
            {
                key: (
                    str(value)
                    if value is not None
                    else None
                )
                for key, value in transaction.items()
            }
            for transaction in transactions
        ]

    @tool
    async def get_customer_loans(
        customer_id: str,
    ) -> list[dict]:
        """
        Get active and historical loans for a customer.

        Use this when the user asks about:
        - loans
        - EMI
        - outstanding balance
        - interest rate
        - loan exposure
        """

        from app.services.loan_service import (
            get_customer_loans as fetch_loans,
        )

        loans =  fetch_loans(
            session,
            UUID(customer_id),
        )

        return [
            {
                key: (
                    str(value)
                    if value is not None
                    else None
                )
                for key, value in loan.items()
            }
            for loan in loans
        ]

    
    @tool
    async def detect_transaction_anomalies(
    customer_id: str,
) -> list[dict]:
        """
    Detect potentially unusual transactions for a customer.

    Use this when the user asks about:
    - suspicious transactions
    - unusual spending
    - anomalies
    - unusual transfers
       """
    
        from app.services.anomaly_service import (
        detect_transaction_anomalies as detect_anomalies,
    )

        return  detect_anomalies(
        session,
        UUID(customer_id),
    )


    
    @tool
    async def search_financial_knowledge(
        query: str,
    ) -> list[dict]:
        """
        Search the financial knowledge base.

        Use this for questions about:
        - banking policies
        - financial products
        - lending rules
        - fees
        - eligibility
        - compliance documentation
        - information contained in uploaded PDFs
        """

        query_embedding = (
            await generate_embeddings(
                [query]
            )
        )[0]

        results =  similarity_search(
            session=session,
            query_embedding=query_embedding,
            top_k=5,
        )

        return [
            {
                "document_id": str(
                    result["document_id"]
                ),
                "file_name": result["file_name"],
                "page_number": result["page_number"],
                "chunk_index": result["chunk_index"],
                "content": result["content"],
                "similarity": float(
                    result["similarity"]
                ),
            }
            for result in results
        ]
    
    

    return [
        get_customer_360,
        get_customer_transactions,
        get_customer_loans,
        search_financial_knowledge,
        detect_transaction_anomalies
    ]