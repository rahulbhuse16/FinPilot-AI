from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class DocumentResponse(BaseModel):
    id: UUID
    file_name: str
    content_type: str
    file_size: int
    status: str
    chunk_count: int
    created_at: datetime