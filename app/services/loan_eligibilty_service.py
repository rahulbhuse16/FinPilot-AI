from decimal import Decimal, InvalidOperation
from io import BytesIO
from typing import Any

import cloudinary
import cloudinary.uploader

from fastapi import HTTPException, UploadFile
from pydantic import BaseModel, Field
from pypdf import PdfReader

from langchain_core.prompts import ChatPromptTemplate

from app.core.config import settings
from app.services.llm_service import get_llm


# ============================================================
# CLOUDINARY CONFIGURATION
# ============================================================

cloudinary.config(
    cloud_name=settings.cloudinary_cloud_name,
    api_key=settings.cloudinary_api_key,
    api_secret=settings.cloudinary_api_secret,
    secure=True,
)


# ============================================================
# LOAN ELIGIBILITY RULES
# ============================================================

MIN_NET_SALARY = Decimal("25000")

MIN_AI_CONFIDENCE = Decimal("0.80")

# Maximum loan amount = monthly net salary × 20
MAX_LOAN_TO_MONTHLY_SALARY = Decimal("20")

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


# ============================================================
# STRUCTURED AI OUTPUT
# ============================================================

class SalarySlipAnalysis(BaseModel):
    """
    Structured output expected from the LLM.
    LangChain will convert the model response directly
    into this Pydantic object.
    """

    is_salary_slip: bool = Field(
        description=(
            "Whether the uploaded document is a genuine salary slip."
        )
    )

    employee_name: str | None = Field(
        default=None,
        description=(
            "Employee name explicitly present on the salary slip."
        ),
    )

    employer_name: str | None = Field(
        default=None,
        description=(
            "Employer/company name explicitly present on the salary slip."
        ),
    )

    gross_salary: Decimal | None = Field(
        default=None,
        description=(
            "Gross salary explicitly mentioned on the salary slip."
        ),
    )

    net_salary: Decimal | None = Field(
        default=None,
        description=(
            "Net salary or in-hand salary explicitly mentioned "
            "on the salary slip."
        ),
    )

    total_deductions: Decimal | None = Field(
        default=None,
        description=(
            "Total deductions explicitly mentioned on the salary slip."
        ),
    )

    pay_period: str | None = Field(
        default=None,
        description=(
            "Salary month or pay period explicitly mentioned."
        ),
    )

    employment_status: str | None = Field(
        default=None,
        description=(
            "Employment status if explicitly mentioned."
        ),
    )

    confidence: float = Field(
        ge=0.0,
        le=1.0,
        description=(
            "Confidence that the document is a valid salary slip "
            "and the extracted information is reliable. "
            "Must be between 0 and 1."
        ),
    )


# ============================================================
# MAIN FUNCTION
# ============================================================

async def checkLoanEligigtibiltyForAmountByAI(
    salary_slip: UploadFile,
    loan_amount: Decimal,
) -> dict[str, Any]:

    # --------------------------------------------------------
    # 1. BASIC VALIDATION
    # --------------------------------------------------------

    if not salary_slip:
        raise HTTPException(
            status_code=400,
            detail="Salary slip is required",
        )

    if salary_slip.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Salary slip must be a PDF",
        )

    if loan_amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Loan amount must be greater than zero",
        )

    # --------------------------------------------------------
    # 2. READ FILE
    # --------------------------------------------------------

    try:
        file_content = await salary_slip.read()

    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail="Unable to read salary slip",
        ) from exc

    if not file_content:
        raise HTTPException(
            status_code=400,
            detail="Salary slip file is empty",
        )

    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Salary slip must be less than 10 MB",
        )

    # --------------------------------------------------------
    # 3. UPLOAD SALARY SLIP TO CLOUDINARY
    # --------------------------------------------------------

    salary_slip_url: str | None = None
    public_id: str | None = None

    try:
        upload_result = cloudinary.uploader.upload(
            BytesIO(file_content),
            folder="finpilot/salary_slips",
            resource_type="raw",
            type="upload",
            public_id=f"salary_slip.pdf",
        )

        salary_slip_url = upload_result.get("secure_url")
        public_id = upload_result.get("public_id")

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Salary slip upload failed",
        ) from exc

    if not salary_slip_url:
        raise HTTPException(
            status_code=500,
            detail="Cloudinary did not return a salary slip URL",
        )

    # --------------------------------------------------------
    # 4. EXTRACT TEXT FROM PDF
    # --------------------------------------------------------

    try:
        reader = PdfReader(BytesIO(file_content))

        pages_text: list[str] = []

        for page in reader.pages:
            text = page.extract_text()

            if text:
                pages_text.append(text)

        document_text = "\n".join(pages_text).strip()

    except Exception as exc:
        raise HTTPException(
            status_code=422,
            detail="Unable to read salary slip PDF",
        ) from exc

    # --------------------------------------------------------
    # 5. CHECK WHETHER TEXT WAS EXTRACTED
    # --------------------------------------------------------

    if not document_text:
        return {
            "eligible": False,
            "reason": (
                "Unable to extract text from salary slip. "
                "The PDF may be scanned or image-based."
            ),
            "salary_slip_url": salary_slip_url,
            "public_id": public_id,
        }

    # --------------------------------------------------------
    # 6. AI ANALYSIS USING LANGCHAIN STRUCTURED OUTPUT
    # --------------------------------------------------------

    try:
        llm = get_llm()

        # LangChain converts the LLM response directly into
        # SalarySlipAnalysis instead of returning raw JSON.
        structured_llm = llm.with_structured_output(
            SalarySlipAnalysis,
            method="function_calling",
        )

        prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """
You are a financial document verification AI.

Analyze the provided salary slip and extract only information
that is explicitly present in the document.

Important rules:

- Do not guess.
- Do not fabricate information.
- Do not calculate missing salary values.
- If a value cannot be reliably identified, return null.
- Determine whether the document is actually a salary slip.
- Extract the employee name when available.
- Extract the employer name when available.
- Extract gross salary when available.
- Extract net/in-hand salary when available.
- Extract total deductions when available.
- Extract the salary period when available.
- Extract employment status when available.
- Provide a confidence score between 0 and 1.
""",
                ),
                (
                    "human",
                    """
Analyze this salary slip:

---------------- SALARY SLIP ----------------

{document}

-------------- END SALARY SLIP --------------
""",
                ),
            ]
        )

        chain = prompt | structured_llm

        print(
            f"📄 Salary slip text extracted: "
            f"{len(document_text)} characters"
        )

        print("🤖 Starting structured salary slip analysis...")

        analysis: SalarySlipAnalysis = await chain.ainvoke(
            {
                "document": document_text,
            }
        )

        print("✅ Structured AI analysis completed")
        print("📊 AI analysis:", analysis)

    except Exception as exc:
        import traceback

        print(
            "❌ AI SALARY SLIP ERROR:",
            repr(exc),
        )

        traceback.print_exc()

        raise HTTPException(
            status_code=422,
            detail="AI salary slip analysis failed",
        ) from exc

    # --------------------------------------------------------
    # 7. EXTRACT AI VALUES
    # --------------------------------------------------------

    is_salary_slip = analysis.is_salary_slip

    confidence = Decimal(
        str(analysis.confidence)
    )

    gross_salary = analysis.gross_salary
    net_salary = analysis.net_salary
    total_deductions = analysis.total_deductions

    # Convert Pydantic model to normal dictionary
    analysis_data = {
        "is_salary_slip": analysis.is_salary_slip,
        "employee_name": analysis.employee_name,
        "employer_name": analysis.employer_name,
        "gross_salary": (
            float(gross_salary)
            if gross_salary is not None
            else None
        ),
        "net_salary": (
            float(net_salary)
            if net_salary is not None
            else None
        ),
        "total_deductions": (
            float(total_deductions)
            if total_deductions is not None
            else None
        ),
        "pay_period": analysis.pay_period,
        "employment_status": analysis.employment_status,
        "confidence": float(confidence),
    }

    # --------------------------------------------------------
    # 8. DOCUMENT VALIDATION
    # --------------------------------------------------------

    if not is_salary_slip:
        return {
            "eligible": False,
            "reason": "Uploaded document is not a valid salary slip",
            "salary_slip_url": salary_slip_url,
            "public_id": public_id,
            "analysis": analysis_data,
        }

    # --------------------------------------------------------
    # 9. AI CONFIDENCE VALIDATION
    # --------------------------------------------------------

    if confidence < MIN_AI_CONFIDENCE:
        return {
            "eligible": False,
            "reason": (
                "Salary slip could not be reliably verified"
            ),
            "salary_slip_url": salary_slip_url,
            "public_id": public_id,
            "analysis": analysis_data,
        }

    # --------------------------------------------------------
    # 10. NET SALARY VALIDATION
    # --------------------------------------------------------

    if net_salary is None:
        return {
            "eligible": False,
            "reason": (
                "Net salary could not be identified "
                "from salary slip"
            ),
            "salary_slip_url": salary_slip_url,
            "public_id": public_id,
            "analysis": analysis_data,
        }

    try:
        net_salary = Decimal(str(net_salary))

    except (InvalidOperation, TypeError, ValueError):
        return {
            "eligible": False,
            "reason": "Invalid net salary detected",
            "salary_slip_url": salary_slip_url,
            "public_id": public_id,
            "analysis": analysis_data,
        }

    # --------------------------------------------------------
    # 11. NET SALARY MUST BE POSITIVE
    # --------------------------------------------------------

    if net_salary <= 0:
        return {
            "eligible": False,
            "reason": "Invalid net salary",
            "salary_slip_url": salary_slip_url,
            "public_id": public_id,
            "analysis": analysis_data,
        }

    # --------------------------------------------------------
    # 12. MINIMUM SALARY RULE
    # --------------------------------------------------------

    if net_salary < MIN_NET_SALARY:
        return {
            "eligible": False,
            "reason": (
                f"Minimum required net salary is "
                f"₹{MIN_NET_SALARY}"
            ),
            "salary_slip_url": salary_slip_url,
            "public_id": public_id,
            "analysis": analysis_data,
            "minimum_required_salary": float(
                MIN_NET_SALARY
            ),
        }

    # --------------------------------------------------------
    # 13. MAXIMUM LOAN AMOUNT
    # --------------------------------------------------------

    maximum_loan_amount = (
        net_salary
        * MAX_LOAN_TO_MONTHLY_SALARY
    )

    # --------------------------------------------------------
    # 14. REQUESTED AMOUNT VALIDATION
    # --------------------------------------------------------

    if loan_amount > maximum_loan_amount:
        return {
            "eligible": False,
            "reason": (
                f"Requested loan amount ₹{loan_amount} "
                f"exceeds maximum eligible amount "
                f"₹{maximum_loan_amount}"
            ),
            "loan_amount": float(loan_amount),
            "maximum_eligible_amount": float(
                maximum_loan_amount
            ),
            "salary_slip_url": salary_slip_url,
            "public_id": public_id,
            "analysis": analysis_data,
        }

    # --------------------------------------------------------
    # 15. ELIGIBLE
    # --------------------------------------------------------

    return {
        "eligible": True,
        "reason": (
            "Customer is eligible for the requested "
            "loan amount"
        ),
        "loan_amount": float(loan_amount),
        "maximum_eligible_amount": float(
            maximum_loan_amount
        ),
        "salary_slip_url": salary_slip_url,
        "public_id": public_id,
        "analysis": analysis_data,
    }

from langchain_groq import ChatGroq

from app.core.config import settings


llm = ChatGroq(
    model=settings.openai_chat_model,
    temperature=0,
    api_key=settings.openai_api_key,
)


def get_llm():
    return llm


async def generate_answer(prompt):
    response = await llm.ainvoke(prompt)

    return response.content

structured_llm = llm.with_structured_output(
    SalarySlipAnalysis,
    method="function_calling",
)
class SalarySlipAnalysis(BaseModel):
    is_salary_slip: bool
    employee_name: str | None
    employer_name: str | None
    gross_salary: Decimal | None
    net_salary: Decimal | None
    total_deductions: Decimal | None
    pay_period: str | None
    employment_status: str | None
    confidence: float
