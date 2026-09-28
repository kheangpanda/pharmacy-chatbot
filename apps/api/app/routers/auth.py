from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_active_user
from app.auth.security import create_access_token, hash_password, verify_password
from app.database import get_db
from app.config import settings
from app.models import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UpdateProfileRequest, UserRead


router = APIRouter(prefix="/auth", tags=["auth"])


def public_user(user: User) -> UserRead:
    return UserRead.model_validate(user)


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, response: Response, db: Session = Depends(get_db)) -> TokenResponse:
    existing = db.scalar(select(User).where(or_(User.email == payload.email, User.username == payload.username)))
    if existing:
        raise HTTPException(status_code=409, detail="Username or email is already registered")
    user = User(email=payload.email, username=payload.username, full_name=payload.full_name, password_hash=hash_password(payload.password), role="USER")
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(str(user.id))
    response.set_cookie("access_token", token, httponly=True, samesite="lax", secure=settings.environment == "production", max_age=settings.jwt_access_token_expire_minutes * 60)
    return TokenResponse(access_token=token, user=public_user(user))


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.scalar(select(User).where(or_(User.email == payload.username_or_email, User.username == payload.username_or_email)))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username/email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account disabled")
    user.last_login_at = datetime.now(timezone.utc)
    db.commit()
    token = create_access_token(str(user.id))
    response.set_cookie("access_token", token, httponly=True, samesite="lax", secure=settings.environment == "production", max_age=settings.jwt_access_token_expire_minutes * 60)
    return TokenResponse(access_token=token, user=public_user(user))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response) -> None:
    response.delete_cookie("access_token")


@router.get("/me", response_model=UserRead)
def me(user: User = Depends(get_current_active_user)) -> UserRead:
    return public_user(user)


@router.patch("/me", response_model=UserRead)
def update_me(payload: UpdateProfileRequest, user: User = Depends(get_current_active_user), db: Session = Depends(get_db)) -> UserRead:
    if payload.email and payload.email != user.email and db.scalar(select(User).where(User.email == payload.email)):
        raise HTTPException(status_code=409, detail="Email is already registered")
    if payload.email:
        user.email = payload.email
    if payload.full_name is not None:
        user.full_name = payload.full_name
    db.commit()
    db.refresh(user)
    return public_user(user)