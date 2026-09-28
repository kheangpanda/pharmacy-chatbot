import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


Confidence = Literal["high", "medium", "low", "insufficient_evidence"]
Provider = Literal["openai", "gemini"]


class Citation(BaseModel):
    document: str
    document_id: uuid.UUID | None = None
    page: int
    section: str | None = None
    content: str | None = None


class ChatRequest(BaseModel):
    question: str = Field(min_length=2, max_length=4000)
    session_id: uuid.UUID | None = None
    provider: Provider | None = None


class ChatResponse(BaseModel):
    question: str
    session_id: uuid.UUID
    intent: str
    answer: str
    citations: list[Citation]
    retrieved_chunks: int
    confidence: Confidence


class SessionCreate(BaseModel):
    title: str = Field(default="New pharmacy chat", max_length=255)


class MessageRead(BaseModel):
    id: uuid.UUID
    role: str
    content: str
    intent: str | None
    citations: list[Citation]
    confidence: str | None
    created_at: datetime


class SessionRead(BaseModel):
    id: uuid.UUID
    title: str
    created_at: datetime
    updated_at: datetime
    message_count: int = 0


class SessionDetail(SessionRead):
    messages: list[MessageRead]

