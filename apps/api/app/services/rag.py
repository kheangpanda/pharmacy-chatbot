from dataclasses import dataclass

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import settings
from app.models import Document, KnowledgeChunk
from app.prompts.pharmacy import SYSTEM_PROMPT
from app.schemas.chat import Provider
from app.services.llm import embed_texts, generate_text
from app.services.intent import extract_entities


@dataclass
class RetrievedChunk:
    chunk: KnowledgeChunk
    document: Document
    distance: float


def retrieve(db: Session, question: str) -> list[RetrievedChunk]:
    ready_chunks = db.scalar(
        select(func.count(KnowledgeChunk.id))
        .join(Document, KnowledgeChunk.document_id == Document.id)
        .where(Document.status == "ready")
    )
    if not ready_chunks:
        return []
    vector = embed_texts([question])[0]
    distance = KnowledgeChunk.embedding.cosine_distance(vector).label("distance")
    statement = (
        select(KnowledgeChunk, Document, distance)
        .join(Document, KnowledgeChunk.document_id == Document.id)
        .where(Document.status == "ready")
        .order_by(distance)
        .limit(settings.retrieval_candidates)
    )
    candidates = [RetrievedChunk(chunk=row[0], document=row[1], distance=float(row[2])) for row in db.execute(statement)]

    entities = extract_entities(question)
    query_terms = {term.lower() for term in question.split() if len(term) > 3}
    unique: list[RetrievedChunk] = []
    seen: set[tuple[str, int, str]] = set()
    for item in candidates:
        key = (str(item.document.id), item.chunk.page_number, item.chunk.content[:100])
        if key in seen:
            continue
        seen.add(key)
        lexical = sum(term in item.chunk.content.lower() for term in query_terms)
        entity_boost = sum(str(value).lower() in item.chunk.content.lower() for value in entities.values())
        item.distance -= min(lexical * 0.01 + entity_boost * 0.02, 0.12)
        unique.append(item)
    unique.sort(key=lambda item: item.distance)
    return unique[: settings.retrieval_top_k]


def generate_answer(question: str, intent: str, evidence: list[RetrievedChunk], provider: Provider | None = None) -> str:
    if not evidence:
        return (
            "## Insufficient evidence in the current knowledge base.\n\n"
            "Try uploading a relevant drug reference, guideline, or pharmacy textbook."
        )
    excerpts = "\n\n".join(
        f"[Excerpt {index} | {item.document.title} | page {item.chunk.page_number} | "
        f"section {item.chunk.section or 'Not specified'}]\n{item.chunk.content}"
        for index, item in enumerate(evidence, 1)
    )
    return generate_text(
        SYSTEM_PROMPT,
        f"Intent: {intent}\nQuestion: {question}\n\nRetrieved evidence:\n{excerpts}",
        provider,
    )
