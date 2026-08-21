from io import BytesIO

from pypdf import PdfReader


def extract_pdf_pages(content: bytes) -> list[dict]:
    reader = PdfReader(BytesIO(content))

    pages = []

    for page_number, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""

        if not text.strip():
            continue

        pages.append(
            {
                "page_number": page_number,
                "content": text,
            }
        )

    return pages