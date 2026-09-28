import re
from pathlib import Path

import fitz
import tiktoken
from sqlalchemy.orm import Session

from app.config import settings
from app.models import Document, KnowledgeChunk
from app.services.llm import embed_texts


def clean_text(value: str) -> str:
    value = value.replace("\x00", " ").replace("\u00ad", "")
    value = re.sub(r"(?<=\w)-\n(?=\w)", "", value)
    value = re.sub(r"[ \t]+", " ", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


def _encoding():
    try:
        return tiktoken.encoding_for_model(settings.openai_embedding_model)
    except KeyError:
        return tiktoken.get_encoding("cl100k_base")


def split_text(text: str, target_tokens: int = 650, overlap_tokens: int = 100) -> list[str]:
    encoder = _encoding()
    paragraphs = [part.strip() for part in re.split(r"\n\s*\n", text) if part.strip()]
    chunks: list[str] = []
    current: list[str] = []
    current_tokens = 0
    for paragraph in paragraphs:
        tokens = encoder.encode(paragraph)
        if len(tokens) > target_tokens:
            if current:
                chunks.append("\n\n".join(current))
                current, current_tokens = [], 0
            step = target_tokens - overlap_tokens
            chunks.extend(encoder.decode(tokens[i : i + target_tokens]) for i in range(0, len(tokens), step))
            continue
        if current and current_tokens + len(tokens) > target_tokens:
            completed = "\n\n".join(current)
            chunks.append(completed)
            overlap = encoder.decode(encoder.encode(completed)[-overlap_tokens:])
            current = [overlap, paragraph]
            current_tokens = len(encoder.encode(overlap)) + len(tokens)
        else:
            current.append(paragraph)
            current_tokens += len(tokens)
    if current:
        chunks.append("\n\n".join(current))
    return [chunk.strip() for chunk in chunks if chunk.strip()]


def infer_section(text: str) -> str | None:
    first = next((line.strip() for line in text.splitlines() if line.strip()), "")
    return first[:500] if 2 <= len(first.split()) <= 14 else None


def ingest_pdf(db: Session, document: Document, path: Path) -> Document:
    try:
        pdf = fitz.open(path)
        document.page_count = pdf.page_count
        metadata = pdf.metadata or {}
        document.author = metadata.get("author") or None
        if metadata.get("title"):
            document.title = metadata["title"].strip()

        pending: list[tuple[int, str, str | None]] = []
        for index, page in enumerate(pdf):
            text = clean_text(page.get_text("text"))
            for chunk in split_text(text):
                pending.append((index + 1, chunk, infer_section(chunk)))
        pdf.close()
        if not pending:
            raise ValueError("No extractable text was found in this PDF")

        vectors = embed_texts([content for _, content, _ in pending])
        for (page_number, content, section), vector in zip(pending, vectors, strict=True):
            db.add(
                KnowledgeChunk(
                    document_id=document.id,
                    page_number=page_number,
                    section=section,
                    content=content,
                    embedding=vector,
                )
            )
        document.status = "ready"
        document.error_message = None
        db.commit()
        db.refresh(document)
        return document
    except Exception as exc:
        db.rollback()
        failed = db.get(Document, document.id)
        if failed:
            failed.status = "failed"
            failed.error_message = str(exc)[:1000]
            db.commit()
            db.refresh(failed)
            return failed
        raise

