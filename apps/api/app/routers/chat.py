import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.models import ChatMessage, ChatSession
from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
    Citation,
    MessageRead,
    SessionCreate,
    SessionDetail,
    SessionRead,
)
from app.services.intent import detect_intent
from app.services.rag import generate_answer, retrieve


router = APIRouter(tags=["chat"])


def session_summary(session: ChatSession, count: int = 0) -> SessionRead:
    return SessionRead(
        id=session.id,
        title=session.title,
        created_at=session.created_at,
        updated_at=session.updated_at,
        message_count=count,
    )


@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest, db: Session = Depends(get_db)) -> ChatResponse:
    session = db.get(ChatSession, payload.session_id) if payload.session_id else None
    if payload.session_id and not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    if not session:
        session = ChatSession(title=payload.question[:80])
        db.add(session)
        db.flush()

    intent = detect_intent(payload.question)
    db.add(ChatMessage(session_id=session.id, role="user", content=payload.question, intent=intent))
    try:
        evidence = retrieve(db, payload.question)
        answer = generate_answer(payload.question, intent, evidence)
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=503, detail="The knowledge service is temporarily unavailable") from exc

    citations = [
        Citation(
            document=item.document.title,
            document_id=item.document.id,
            page=item.chunk.page_number,
            section=item.chunk.section,
            content=item.chunk.content,
        )
        for item in evidence
    ]
    confidence = "insufficient_evidence" if not evidence else "high" if len(evidence) >= 4 else "medium" if len(evidence) >= 2 else "low"
    db.add(
        ChatMessage(
            session_id=session.id,
            role="assistant",
            content=answer,
            intent=intent,
            citations=[item.model_dump(mode="json") for item in citations],
            confidence=confidence,
        )
    )
    session.updated_at = func.now()
    db.commit()
    return ChatResponse(
        question=payload.question,
        session_id=session.id,
        intent=intent,
        answer=answer,
        citations=citations,
        retrieved_chunks=len(evidence),
        confidence=confidence,
    )


@router.post("/chat/sessions", response_model=SessionRead, status_code=status.HTTP_201_CREATED)
def create_session(payload: SessionCreate, db: Session = Depends(get_db)) -> SessionRead:
    session = ChatSession(title=payload.title)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session_summary(session)


@router.get("/chat/sessions", response_model=list[SessionRead])
def list_sessions(db: Session = Depends(get_db)) -> list[SessionRead]:
    statement = (
        select(ChatSession, func.count(ChatMessage.id))
        .outerjoin(ChatMessage)
        .group_by(ChatSession.id)
        .order_by(ChatSession.updated_at.desc())
    )
    return [session_summary(session, count) for session, count in db.execute(statement)]


@router.get("/chat/sessions/{session_id}", response_model=SessionDetail)
def get_session(session_id: uuid.UUID, db: Session = Depends(get_db)) -> SessionDetail:
    session = db.scalar(select(ChatSession).options(selectinload(ChatSession.messages)).where(ChatSession.id == session_id))
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    messages = [
        MessageRead(
            id=message.id,
            role=message.role,
            content=message.content,
            intent=message.intent,
            citations=message.citations or [],
            confidence=message.confidence,
            created_at=message.created_at,
        )
        for message in session.messages
    ]
    return SessionDetail(**session_summary(session, len(messages)).model_dump(), messages=messages)


@router.delete("/chat/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(session_id: uuid.UUID, db: Session = Depends(get_db)) -> None:
    session = db.get(ChatSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    db.delete(session)
    db.commit()

