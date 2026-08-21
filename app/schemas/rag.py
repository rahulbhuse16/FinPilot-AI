from pydantic import BaseModel


class SourceCitation(BaseModel):
    document_id: str
    file_name: str
    page_number: int | None
    chunk_index: int


class RAGResponse(BaseModel):
    answer: str
    sources: list[SourceCitation]