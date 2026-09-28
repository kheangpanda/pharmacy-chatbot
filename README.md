# Pharmacy Intelligence

Pharmacy Intelligence is a pharmacist-focused, evidence-based RAG workspace. Pharmacists upload PDF references, index page-preserving passages into PostgreSQL/pgvector, ask clinical pharmacy questions, and verify every generated answer against visible source citations.

> This is a knowledge-support system, not an autonomous prescribing system. Clinical judgment, patient-specific assessment, and local protocols remain essential.

## Architecture

```text
                    ┌─────────────────┐
                    │   Pharmacist    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Next.js + MUI   │
                    │   TypeScript    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │     FastAPI     │
                    └───────┬─────────┘
                            │
              ┌─────────────┼──────────────┐
              │             │              │
              ▼             ▼              ▼
        Intent/Entity     pgvector       OpenAI
          extraction      retrieval
                            │
                            ▼
                     Pharmacy PDFs
```

The browser calls `/api/backend/*`; a Next.js rewrite proxies requests to FastAPI. In Docker that destination is `http://api:8000`, keeping browser CORS simple. FastAPI connects to PostgreSQL at `db:5432`.

## Directory structure

```text
apps/web/          Next.js App Router UI, components, hooks, services, types
apps/api/          FastAPI application, RAG services, SQLAlchemy models, tests
packages/shared/   Reserved shared-contract package
infra/postgres/    pgvector extension, tables, and indexes
docker-compose.yml Local application stack
```

## Quick start with Docker

1. Copy the environment template and add an OpenAI API key:

   ```bash
   cp .env.example .env
   ```

2. Start the complete stack:

   ```bash
   docker compose up --build
   ```

3. Open:

   - Web: [http://localhost:3000](http://localhost:3000)
   - API: [http://localhost:8000](http://localhost:8000)
   - Swagger: [http://localhost:8000/docs](http://localhost:8000/docs)
   - PostgreSQL: `localhost:5432`, database `pharmacy_chatbot`

Source folders are mounted into development containers. Next.js runs `next dev`; FastAPI runs uvicorn with reload. Named volumes keep container `node_modules`, `.next`, uploads, and PostgreSQL data isolated and persistent.

## Environment variables

| Variable | Purpose | Browser-visible |
|---|---|---|
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | PostgreSQL bootstrap | No |
| `OPENAI_API_KEY` | Embeddings and grounded answer generation | No |
| `OPENAI_CHAT_MODEL` | Chat completion model | No |
| `OPENAI_EMBEDDING_MODEL` | Embedding model; defaults to 1536-dimensional `text-embedding-3-small` | No |
| `NEXT_PUBLIC_APP_NAME` | Product label | Yes |
| `NEXT_PUBLIC_API_URL` | Browser API base; Docker overrides it to `/api/backend` | Yes |
| `DATABASE_URL` | API database DSN, assembled by Compose | No |

Do not prefix secrets with `NEXT_PUBLIC_`.

## Local development without Docker

PostgreSQL 16 with pgvector must already be available. Point `DATABASE_URL` at it, then:

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

In a second terminal:

```bash
cd apps/web
npm install
BACKEND_URL=http://localhost:8000 NEXT_PUBLIC_API_URL=/api/backend npm run dev
```

Useful root shortcuts are `make up`, `make down`, `make build`, `make logs`, `make web`, `make api`, and `make db`.

## Frontend architecture

The App Router exposes `/chat`, `/knowledge`, `/documents`, and `/settings`; `/` redirects to `/chat`. The responsive application shell uses a collapsible desktop sidebar and mobile drawer. TanStack Query owns server state and query invalidation. Axios provides one API client. Upload and deletion are mutations that invalidate document queries.

Chat history is loaded from persisted sessions. Assistant messages render concise clinical sections, intent and evidence labels, visible source chips, and a right-side evidence drawer with document, page, section, and the full retrieved passage. Insufficient evidence is displayed as a prominent warning rather than disguised as a normal answer.

## Backend and RAG architecture

SQLAlchemy models represent `documents`, `knowledge_chunks`, `chat_sessions`, and `chat_messages`. The API creates missing tables at startup; `infra/postgres/init.sql` also creates the extension/schema for a new Docker volume.

PDF ingestion follows this lifecycle:

1. Validate and safely store each PDF.
2. Extract each page independently with PyMuPDF.
3. Clean soft hyphens, line-wrap hyphenation, and excess whitespace.
4. Split paragraphs into approximately 650-token chunks with about 100-token overlap.
5. Preserve document ID, page number, inferred section, and original content.
6. Generate OpenAI embeddings in batches.
7. Store 1536-dimensional vectors in pgvector and mark the source ready.

Chat requests detect pharmacy intent and selected clinical entities, embed the question, retrieve 20 candidates by cosine distance, remove duplicate passages, apply light metadata/lexical reranking, and pass up to 6 excerpts to the model. The system prompt prohibits unsupported additions, manufactured citations, autonomous prescribing, and guessed patient-specific doses. Both user and assistant turns are committed to the selected chat session.

If the configured embedding model emits a dimension other than 1536, update both the SQLAlchemy `Vector(1536)` declaration and `infra/postgres/init.sql`, then recreate the database volume.

## API endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/chat` | Ask a grounded question, optionally with `session_id` |
| `POST` | `/chat/sessions` | Create a chat session |
| `GET` | `/chat/sessions` | List chat history |
| `GET` | `/chat/sessions/{id}` | Restore a conversation and messages |
| `DELETE` | `/chat/sessions/{id}` | Delete a conversation |
| `POST` | `/documents/upload` | Upload and synchronously ingest multiple PDFs |
| `GET` | `/documents` | List sources and index totals |
| `GET` | `/documents/{id}` | Read metadata and indexed chunks |
| `DELETE` | `/documents/{id}` | Delete a source and its chunks |
| `GET` | `/health` | Check API and database connectivity |

Example chat payload:

```json
{
  "session_id": null,
  "question": "Can metformin be used when eGFR is 35?"
}
```

## Example questions

- What are the contraindications of metformin?
- Does clarithromycin interact with simvastatin?
- What counseling should be provided for warfarin?
- What does the knowledge base say about insulin storage?
- What information is available about metformin and renal impairment?

## Verification and production notes

Validate Compose before starting:

```bash
docker compose config
docker compose up --build
```

For production, replace development commands with immutable images, run database migrations (Alembic), place TLS/authentication in front of the services, restrict upload size and MIME inspection, add malware scanning, use object storage for PDFs, add background jobs for large ingestions, apply row-level tenancy/authorization, audit access, configure backups, and review applicable privacy and health-data requirements. Do not log patient-identifying content. Use managed secrets rather than `.env` files.
