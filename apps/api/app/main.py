from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.config import settings
from app.auth.security import hash_password
from app.database import Base, SessionLocal, engine
from app.models import User
from app.routers.auth import router as auth_router
from app.routers.admin import router as admin_router
from app.routers.chat import router as chat_router
from app.routers.documents import router as documents_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    with engine.begin() as connection:
        connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        Base.metadata.create_all(connection)
        connection.execute(text("ALTER TABLE documents ADD COLUMN IF NOT EXISTS chunk_count INTEGER NOT NULL DEFAULT 0"))
        connection.execute(text("ALTER TABLE documents ADD COLUMN IF NOT EXISTS uploaded_by UUID"))
        connection.execute(text("ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS user_id UUID"))
        connection.execute(text("ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS user_id UUID"))
        connection.execute(text("ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS retrieved_chunks INTEGER"))
    with SessionLocal() as db:
        admin_id = db.scalar(text("SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1"))
        if not admin_id:
            if settings.environment == "production" and (not settings.admin_password or settings.admin_password in {"admin", "password", "change-this-admin-password"}):
                raise RuntimeError("ADMIN_PASSWORD must be configured with a strong value in production")
            if not settings.admin_password:
                raise RuntimeError("ADMIN_PASSWORD is required to seed the initial administrator")
            user = User(email=settings.admin_email, username=settings.admin_username, password_hash=hash_password(settings.admin_password), role="ADMIN")
            db.add(user)
            db.commit()
            admin_id = user.id
        db.execute(text("UPDATE chat_sessions SET user_id = :admin_id WHERE user_id IS NULL"), {"admin_id": admin_id})
        db.execute(text("UPDATE chat_messages SET user_id = sessions.user_id FROM chat_sessions sessions WHERE chat_messages.session_id = sessions.id AND chat_messages.user_id IS NULL"))
        db.commit()
    yield


app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(chat_router)
app.include_router(documents_router)
app.include_router(auth_router)
app.include_router(admin_router)


@app.get("/health", tags=["system"])
def health() -> dict[str, str]:
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected", "rag": "ready", "auth": "ready"}
    except Exception:
        raise HTTPException(status_code=503, detail="Database unavailable")
