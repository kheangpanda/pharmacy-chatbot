import shutil
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.auth.dependencies import require_admin
from app.config import settings
from app.database import get_db
from app.models import Document, KnowledgeChunk, User
from app.schemas.documents import DocumentDetail, DocumentList, DocumentRead, UploadResponse
from app.services.ingestion import ingest_pdf


router = APIRouter(prefix="/documents", tags=["documents"])


def serialize_document(document: Document, chunk_count: int | None = None) -> DocumentRead:
    count = chunk_count if chunk_count is not None else len(document.chunks)
    return DocumentRead.model_validate(document).model_copy(update={"chunk_count": count})


@router.post("/upload", response_model=UploadResponse, status_code=status.HTTP_201_CREATED)
def upload_documents(files: list[UploadFile] = File(...), db: Session = Depends(get_db), admin: User = Depends(require_admin)) -> UploadResponse:
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    results: list[DocumentRead] = []
    for upload in files:
        filename = Path(upload.filename or "document.pdf").name
        if upload.content_type != "application/pdf" and not filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=415, detail=f"{filename} is not a PDF")
        document = Document(title=Path(filename).stem, filename=filename, status="processing", uploaded_by=admin.id)
        db.add(document)
        db.commit()
        db.refresh(document)
        destination = upload_dir / f"{document.id}.pdf"
        with destination.open("wb") as target:
            shutil.copyfileobj(upload.file, target)
        if destination.stat().st_size > settings.max_upload_size_mb * 1024 * 1024:
            destination.unlink(missing_ok=True)
            db.delete(document)
            db.commit()
            raise HTTPException(status_code=413, detail=f"{filename} exceeds the {settings.max_upload_size_mb} MB upload limit")
        processed = ingest_pdf(db, document, destination)
        count = db.scalar(select(func.count(KnowledgeChunk.id)).where(KnowledgeChunk.document_id == processed.id)) or 0
        results.append(serialize_document(processed, count))
    return UploadResponse(documents=results)


@router.get("", response_model=DocumentList)
def list_documents(db: Session = Depends(get_db), _: User = Depends(require_admin)) -> DocumentList:
    counts = (
        select(Document, func.count(KnowledgeChunk.id).label("chunk_count"))
        .outerjoin(KnowledgeChunk)
        .group_by(Document.id)
        .order_by(Document.created_at.desc())
    )
    rows = db.execute(counts).all()
    items = [serialize_document(document, count) for document, count in rows]
    return DocumentList(
        items=items,
        total=len(items),
        pages_indexed=sum(item.page_count for item in items if item.status == "ready"),
        chunks_indexed=sum(item.chunk_count for item in items if item.status == "ready"),
    )


@router.get("/{document_id}", response_model=DocumentDetail)
def get_document(document_id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(require_admin)) -> DocumentDetail:
    document = db.scalar(select(Document).options(selectinload(Document.chunks)).where(Document.id == document_id))
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    base = serialize_document(document)
    return DocumentDetail(**base.model_dump(), chunks=document.chunks)


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(document_id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(require_admin)) -> None:
    document = db.get(Document, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    db.delete(document)
    db.commit()
    path = Path(settings.upload_dir) / f"{document_id}.pdf"
    path.unlink(missing_ok=True)

