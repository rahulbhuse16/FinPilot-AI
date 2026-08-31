import json
from uuid import UUID

from langchain_core.messages import (
    SystemMessage,
    HumanMessage,
)

from sqlalchemy.ext.asyncio import AsyncSession

from app.services import llm_service
from app.services.financial_tools import (
    build_financial_tools,
)


SYSTEM_INSTRUCTION = """
You are FinPilot AI, an enterprise financial
intelligence analyst.

Your job is to analyze ONLY verified financial
information retrieved from FinPilot backend tools.

You are not a generic chatbot.

==================================================
STRICT FINANCIAL RULES
==================================================

1. NEVER invent financial information.

2. NEVER fabricate:
   - balances
   - transactions
   - credit scores
   - loan amounts
   - percentages
   - risk levels
   - anomaly counts
   - financial metrics

3. Every insight must be supported by supplied data.

4. Do not make assumptions that are not supported
   by the backend data.

5. Prefer fewer high-quality insights over many
   weak insights.

6. Never accuse a customer of fraud.

7. A large transaction alone does NOT mean fraud.

8. Use "requires review" or "requires attention"
   when appropriate.

==================================================
SEVERITY
==================================================

Use exactly:

positive
warning
danger

danger:
Significant verified financial risk or anomaly.

warning:
Something requiring analyst attention.

positive:
Verified healthy or stable observation.

==================================================
ANALYSIS
==================================================

Analyze:

- transaction anomalies
- unusual transactions
- customer risk
- credit profile
- loan exposure
- financial health
- spending patterns
- unusual transfers
- customer financial information

Only discuss RAG/policy information if such
information is explicitly supplied.

==================================================
OUTPUT
==================================================

Return ONLY valid JSON.

Maximum 5 insights.

Format:

{
  "insights": [
    {
      "id": "unique-id",
      "category": "Transaction Risk",
      "title": "Short title",
      "description": "Evidence based explanation",
      "severity": "danger",
      "customer_id": "UUID or null"
    }
  ]
}

If no meaningful insights exist:

{
  "insights": []
}

==================================================
STYLE
==================================================

Titles must be concise.

Descriptions must be one or two sentences.

Do not use:

"I think"
"I believe"
"probably"
"maybe"

Do not provide investment advice.

Do not invent external financial knowledge.

You are a financial intelligence system,
not a financial advisor.
"""


async def generate_ai_insights(
    session: AsyncSession,
    customer_ids: list[UUID],
) -> dict:

    if not customer_ids:
        return {
            "insights": []
        }

    tools = build_financial_tools(
        session
    )

    tools_by_name = {
        tool.name: tool
        for tool in tools
    }

    get_customer_360 = (
        tools_by_name["get_customer_360"]
    )

    get_customer_transactions = (
        tools_by_name[
            "get_customer_transactions"
        ]
    )

    get_customer_loans = (
        tools_by_name[
            "get_customer_loans"
        ]
    )

    detect_anomalies = (
        tools_by_name[
            "detect_transaction_anomalies"
        ]
    )

    financial_context = []

    for customer_id in customer_ids:

        customer_id_str = str(customer_id)

        customer = await (
            get_customer_360.ainvoke(
                {
                    "customer_id":
                        customer_id_str
                }
            )
        )

        transactions = await (
            get_customer_transactions.ainvoke(
                {
                    "customer_id":
                        customer_id_str,
                    "limit": 20,
                }
            )
        )

        loans = await (
            get_customer_loans.ainvoke(
                {
                    "customer_id":
                        customer_id_str
                }
            )
        )

        anomalies = await (
            detect_anomalies.ainvoke(
                {
                    "customer_id":
                        customer_id_str
                }
            )
        )

        financial_context.append(
            {
                "customer": customer,
                "transactions": transactions,
                "loans": loans,
                "anomalies": anomalies,
            }
        )

    prompt = f"""
Analyze the following verified financial
information.

ONLY use this information.

FINANCIAL DATA:

{json.dumps(
    financial_context,
    indent=2,
    default=str,
)}

Generate up to 5 important insights for the
FinPilot executive dashboard.

Focus on:

1. Transaction risk
2. Customer risk
3. Financial health
4. Loan exposure
5. Unusual financial behavior

Every statement must be supported by the data.

Return ONLY the JSON structure specified
by the system instruction.
"""

    response =  llm_service.llm.invoke(
        [
            SystemMessage(
                content=SYSTEM_INSTRUCTION
            ),
            HumanMessage(
                content=prompt
            ),
        ]
    )

    content = response.content

    if isinstance(content, list):

        content = "".join(
            block.get("text", "")
            for block in content
            if isinstance(block, dict)
        )

    try:

        result = json.loads(content)

        if not isinstance(result, dict):
            return {
                "insights": []
            }

        if not isinstance(
            result.get("insights"),
            list,
        ):
            return {
                "insights": []
            }

        return result

    except json.JSONDecodeError:

        return {
            "insights": []
        }