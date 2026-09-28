# Pharmacy Intelligence

Pharmacy Intelligence is an evidence-based pharmacy knowledge assistant for pharmacists. Authenticated users can ask questions against uploaded PDF references and inspect page-level citations. Administrators can manage users, chat activity, documents, RAG configuration, and system health.

This is a knowledge-support system, not an autonomous prescribing system. Clinical judgment, patient-specific assessment, current references, and local protocols remain essential.

## Architecture

```text
                    ┌────────────────────┐
                    │    Pharmacist      │
                    └─────────┬──────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │ Next.js/TypeScript │
                    │        MUI         │
                    └─────────┬──────────┘
                              │ /api/backend
                              ▼
                    ┌────────────────────┐
                    │      FastAPI       │
                    │ Auth + RAG + Admin │
                    └──────┬───────┬─────┘
                           │       │
                           ▼       ▼
                    PostgreSQL   OpenAI/Gemini
                    + pgvector   chat + embeddings
                           │
                           ▼
                    Pharmacy PDFs
```

The monorepo contains `apps/web` (Next.js App Router, MUI, TanStack Query, Axios), `apps/api` (FastAPI, SQLAlchemy, PyMuPDF, pgvector), `infra/postgres`, and `packages/shared`.

## Quick Start

```bash
cp .env.example .env
# Set ADMIN_PASSWORD, JWT_SECRET_KEY, and at least one provider API key.
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000). The API is available at [http://localhost:8000](http://localhost:8000), Swagger at [http://localhost:8000/docs](http://localhost:8000/docs), and PostgreSQL at `localhost:5432`.

The first startup creates an administrator from `ADMIN_USERNAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` if no administrator exists. Public registration always creates a `USER`; it cannot select `ADMIN`.

## Environment

Important variables are documented in `.env.example`:

- `JWT_SECRET_KEY`, `JWT_ALGORITHM`, `JWT_ACCESS_TOKEN_EXPIRE_MINUTES`
- `ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- `OPENAI_API_KEY`, `OPENAI_CHAT_MODEL`, `OPENAI_EMBEDDING_MODEL`
- `GEMINI_API_KEY`, `GEMINI_CHAT_MODEL`, `GEMINI_EMBEDDING_MODEL`
- `LLM_PROVIDER` (`openai` or `gemini`)
- PostgreSQL connection variables

Secrets stay in the backend environment. They are never returned by APIs or prefixed with `NEXT_PUBLIC_`. In production, use a secret manager, a strong JWT key, and a strong admin password. The development admin password fallback is intentionally rejected in production.

## Authentication and Roles

Authentication uses Argon2 password hashes and JWT access tokens delivered through an HTTP-only `access_token` cookie. Bearer tokens are also accepted for API clients. Cookies use `SameSite=Lax` and become `Secure` in production.

`USER` accounts can register, manage their profile, create and delete their own sessions, ask questions, and inspect their own citations. `ADMIN` accounts can also view all users and chats, manage documents, inspect statistics, and view non-secret system settings. Backend dependencies enforce these permissions; frontend guards are only a usability layer.

## Routes

Public web routes: `/login`, `/register`.

User routes: `/chat`, `/profile`.

Admin routes: `/admin`, `/admin/users`, `/admin/chats`, `/admin/settings`, `/documents`, `/knowledge`.

Authentication API: `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `PATCH /auth/me`.

User chat API: `POST /chat`, `POST /chat/sessions`, `GET /chat/sessions`, `GET /chat/sessions/{id}`, `DELETE /chat/sessions/{id}`.

Admin API: `GET /admin/dashboard`, `GET /admin/users`, `GET /admin/chats`, `GET /admin/chats/{id}`, `PATCH /admin/users/{id}/status`, `GET /admin/settings`, `PATCH /admin/settings/{key}`, `GET /admin/system`.

Knowledge API: `POST /documents/upload`, `GET /documents`, `GET /documents/{id}`, `DELETE /documents/{id}`. All knowledge routes require an administrator.

## RAG Workflow

PDFs are validated, stored with server-generated UUID filenames, extracted page by page with PyMuPDF, cleaned, split into approximately 650-token chunks with overlap, embedded, and stored in pgvector with document and page metadata preserved.

Questions are classified, embedded, retrieved using cosine similarity, lightly reranked with lexical and entity matches, deduplicated, and passed with the best evidence to the configured chat provider. Answers return citations containing document name, page, section, and retrieved content. When evidence is missing, the assistant says: `Insufficient evidence in the current knowledge base.`

OpenAI uses `text-embedding-3-small` and `gpt-4o-mini` by default. Gemini uses `gemini-embedding-001` at the configured 1536-dimensional output and `gemini-2.0-flash`. Keep the embedding dimension consistent with the pgvector column when changing models.

## Persistence and Docker

Persistent host data is mounted at:

- `./data/postgres` for PostgreSQL
- `./data/uploads` for uploaded PDFs

The API connects to `db:5432` inside Compose, never `localhost`. The browser calls `/api/backend/*`, and Next.js rewrites those requests to `http://api:8000`. The web container retains only its dependency/build volumes; application data is stored on the host mounts above.

Useful commands:

```bash
make up
make down
make build
make logs
make web
make api
make db
docker compose config
```

## Testing

Backend tests live in `apps/api/tests` and cover intent extraction plus password/JWT behavior. Run them in the API environment with `pytest -q`. Build the frontend with `cd apps/web && npm run build`.

For a full local check:

```bash
docker compose config
docker compose up --build
curl http://localhost:8000/health
```

## Security Notes

Passwords are never stored in plaintext. User and chat ownership is checked in the API. Admin access is role-checked on every admin route. PDF uploads are administrator-only, restricted to PDFs, stored under safe generated names, and limited by `MAX_UPLOAD_SIZE_MB` configuration. Passwords, JWTs, API keys, database credentials, hidden prompts, and chain-of-thought are not exposed through API responses.

Use HTTPS, managed secrets, backups, malware scanning, object storage, background ingestion jobs, and a formal migration tool such as Alembic before production use. The current startup migration is idempotent for this development monorepo and preserves existing data while adding authentication ownership columns.