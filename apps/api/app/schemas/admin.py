import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.auth import UserRead
from app.schemas.chat import Citation


class UserStatusUpdate(BaseModel):
    is_active: bool


class AdminChatSummary(BaseModel):
    session_id: uuid.UUID
    user_id: uuid.UUID
    username: str
    title: str
    message_count: int
    created_at: datetime
    updated_at: datetime


class AdminMessageRead(BaseModel):
    id: uuid.UUID
    role: str
    content: str
    intent: str | None
    citations: list[Citation]
    confidence: str | None
    retrieved_chunks: int | None
    created_at: datetime


class AdminChatDetail(BaseModel):
    session_id: uuid.UUID
    user: UserRead
    title: str
    created_at: datetime
    updated_at: datetime
    messages: list[AdminMessageRead]


class DashboardStats(BaseModel):
    users: dict[str, int]
    chats: dict[str, int]
    knowledge_base: dict[str, int]
    system: dict[str, Any]


class SettingRead(BaseModel):
    key: str
    value: Any
    description: str | None
    updated_at: datetime


class SettingUpdate(BaseModel):
    value: Any
    description: str | None = Field(default=None, max_length=500)