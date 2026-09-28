import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DocumentRead(BaseModel):
    id: uuid.UUID
    title: str
    filename: str
    author: str | None
    description: str | None
    page_count: int
    chunk_count: int = 0
    status: str
    error_message: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DocumentList(BaseModel):
    items: list[DocumentRead]
    total: int
    pages_indexed: int
    chunks_indexed: int


class UploadResponse(BaseModel):
    documents: list[DocumentRead]


class ChunkRead(BaseModel):
    id: uuid.UUID
    page_number: int
    chapter: str | None
    section: str | None
    content: str

    model_config = ConfigDict(from_attributes=True)


class DocumentDetail(DocumentRead):
    chunks: list[ChunkRead]

