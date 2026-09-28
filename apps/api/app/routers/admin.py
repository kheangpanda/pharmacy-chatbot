import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.auth.dependencies import require_admin
from app.config import settings
from app.database import get_db
from app.models import ChatMessage, ChatSession, Document, KnowledgeChunk, User
from app.schemas.admin import AdminChatDetail, AdminChatSummary, AdminMessageRead, DashboardStats, SettingRead, SettingUpdate, UserStatusUpdate
from app.schemas.auth import UserRead


router = APIRouter(prefix="/admin", tags=["admin"])


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


@router.get("/dashboard", response_model=DashboardStats)
def dashboard(db: Session = Depends(get_db), _: User = Depends(require_admin)) -> DashboardStats:
    current = now_utc()
    today = current.replace(hour=0, minute=0, second=0, microsecond=0)
    week = current - timedelta(days=7)
    month = current - timedelta(days=30)
    return DashboardStats(
        users={
            "total": db.scalar(select(func.count(User.id))) or 0,
            "active": db.scalar(select(func.count(User.id)).where(User.is_active.is_(True))) or 0,
            "new_today": db.scalar(select(func.count(User.id)).where(User.created_at >= today)) or 0,
        },
        chats={
            "total_sessions": db.scalar(select(func.count(ChatSession.id))) or 0,
            "total_messages": db.scalar(select(func.count(ChatMessage.id))) or 0,
            "questions_today": db.scalar(select(func.count(ChatMessage.id)).where(ChatMessage.role == "user", ChatMessage.created_at >= today)) or 0,
            "questions_last_7_days": db.scalar(select(func.count(ChatMessage.id)).where(ChatMessage.role == "user", ChatMessage.created_at >= week)) or 0,
            "questions_this_month": db.scalar(select(func.count(ChatMessage.id)).where(ChatMessage.role == "user", ChatMessage.created_at >= month)) or 0,
        },
        knowledge_base={
            "documents": db.scalar(select(func.count(Document.id))) or 0,
            "pages": db.scalar(select(func.coalesce(func.sum(Document.page_count), 0))) or 0,
            "chunks": db.scalar(select(func.count(KnowledgeChunk.id))) or 0,
            "ready_documents": db.scalar(select(func.count(Document.id)).where(Document.status == "ready")) or 0,
            "failed_documents": db.scalar(select(func.count(Document.id)).where(Document.status == "failed")) or 0,
        },
        system={
            "database": "healthy",
            "rag": "ready",
            "chat_model": settings.openai_chat_model if settings.llm_provider == "openai" else settings.gemini_chat_model,
            "embedding_model": settings.openai_embedding_model if settings.llm_provider == "openai" else settings.gemini_embedding_model,
            "provider": settings.llm_provider,
            "openai_configured": bool(settings.openai_api_key),
            "gemini_configured": bool(settings.gemini_api_key),
        },
    )


@router.get("/users", response_model=list[UserRead])
def list_users(
    search: str | None = Query(default=None),
    role: str | None = Query(default=None),
    is_active: bool | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> list[User]:
    statement = select(User).order_by(User.created_at.desc()).offset(offset).limit(limit)
    if search:
        statement = statement.where(or_(User.username.ilike(f"%{search}%"), User.email.ilike(f"%{search}%"), User.full_name.ilike(f"%{search}%")))
    if role:
        statement = statement.where(User.role == role.upper())
    if is_active is not None:
        statement = statement.where(User.is_active.is_(is_active))
    return list(db.scalars(statement))


@router.get("/users/{user_id}", response_model=UserRead)
def get_user(user_id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(require_admin)) -> User:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/users/{user_id}/status", response_model=UserRead)
def update_user_status(user_id: uuid.UUID, payload: UserStatusUpdate, db: Session = Depends(get_db), admin: User = Depends(require_admin)) -> User:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id and not payload.is_active:
        raise HTTPException(status_code=400, detail="You cannot disable your own account")
    if user.role == "ADMIN" and not payload.is_active:
        active_admins = db.scalar(select(func.count(User.id)).where(User.role == "ADMIN", User.is_active.is_(True))) or 0
        if active_admins <= 1:
            raise HTTPException(status_code=400, detail="Cannot disable the last active administrator")
    user.is_active = payload.is_active
    db.commit()
    db.refresh(user)
    return user


@router.get("/chats", response_model=list[AdminChatSummary])
def list_chats(
    search: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> list[AdminChatSummary]:
    statement = (
        select(ChatSession, User.username, func.count(ChatMessage.id))
        .join(User, ChatSession.user_id == User.id)
        .outerjoin(ChatMessage)
        .group_by(ChatSession.id, User.username)
        .order_by(ChatSession.updated_at.desc())
        .offset(offset)
        .limit(limit)
    )
    if search:
        statement = statement.where(or_(ChatSession.title.ilike(f"%{search}%"), User.username.ilike(f"%{search}%")))
    return [AdminChatSummary(session_id=session.id, user_id=session.user_id, username=username, title=session.title, message_count=count, created_at=session.created_at, updated_at=session.updated_at) for session, username, count in db.execute(statement)]


@router.get("/chats/{session_id}", response_model=AdminChatDetail)
def get_chat(session_id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(require_admin)) -> AdminChatDetail:
    session = db.scalar(select(ChatSession).options(selectinload(ChatSession.messages), selectinload(ChatSession.user)).where(ChatSession.id == session_id))
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    messages = [AdminMessageRead(id=item.id, role=item.role, content=item.content, intent=item.intent, citations=item.citations or [], confidence=item.confidence, retrieved_chunks=item.retrieved_chunks, created_at=item.created_at) for item in session.messages]
    return AdminChatDetail(session_id=session.id, user=session.user, title=session.title, created_at=session.created_at, updated_at=session.updated_at, messages=messages)


@router.get("/stats", response_model=DashboardStats)
def stats(db: Session = Depends(get_db), admin: User = Depends(require_admin)) -> DashboardStats:
    return dashboard(db, admin)


@router.get("/system")
def system(_: User = Depends(require_admin)) -> dict[str, str | bool]:
    return {"database": "healthy", "rag": "ready", "provider": settings.llm_provider, "openai_configured": bool(settings.openai_api_key), "gemini_configured": bool(settings.gemini_api_key)}


@router.get("/settings", response_model=list[SettingRead])
def list_settings(db: Session = Depends(get_db), _: User = Depends(require_admin)) -> list[SettingRead]:
    from app.models.entities import SystemSetting

    return list(db.scalars(select(SystemSetting).order_by(SystemSetting.key)))


@router.patch("/settings/{key}", response_model=SettingRead)
def update_setting(key: str, payload: SettingUpdate, db: Session = Depends(get_db), admin: User = Depends(require_admin)) -> SettingRead:
    from app.models.entities import SystemSetting

    if key.endswith("api_key") or "secret" in key.lower() or "password" in key.lower():
        raise HTTPException(status_code=400, detail="Secret settings cannot be changed through this endpoint")
    setting = db.scalar(select(SystemSetting).where(SystemSetting.key == key))
    if not setting:
        setting = SystemSetting(key=key, value=payload.value, description=payload.description, updated_by=admin.id)
        db.add(setting)
    else:
        setting.value = payload.value
        setting.description = payload.description
        setting.updated_by = admin.id
    db.commit()
    db.refresh(setting)
    return setting