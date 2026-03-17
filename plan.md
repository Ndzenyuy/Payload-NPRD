# Plan: Payload + PostgreSQL in Containers

## Goal

Run the payload workspace (frontend + backend) together with PostgreSQL in containers so that each service can talk to the other. No modifications to the project's own files (frontend/backend); all orchestration and scripts live at repo root and in `scripts/`.

## Current state

- **Backend** ([backend/src/payload.config.ts](backend/src/payload.config.ts)): Payload on port **3001**, uses `DATABASE_URI`, `PAYLOAD_SECRET`, `PAYLOAD_URL`, `FRONTEND_URL`; CORS allows frontend origin; [backend/Dockerfile](backend/Dockerfile) builds from `backend/` and exposes 3001.
- **Frontend**: Next.js on port **3000**, calls backend via `NEXT_PUBLIC_PAYLOAD_URL` ([frontend/src/pages/_app.js](frontend/src/pages/_app.js), [frontend/src/pages/[[...slug]].js](frontend/src/pages/[[...slug]].js)); [frontend/Dockerfile](frontend/Dockerfile) builds from `frontend/`, standalone output, exposes 3000.
- **Root**: plan.md, change.md, commands.md, readme.md, prerequisites.md, [scripts/install-prereqs.sh](scripts/install-prereqs.sh). No compose or env files yet.

## Target architecture

```mermaid
flowchart LR
  subgraph host [Host]
    Browser[Browser]
  end
  subgraph docker [Docker network]
    Postgres[(PostgreSQL)]
    Backend[Backend :3001]
    Frontend[Frontend :3000]
  end
  Browser -->|":3000"| Frontend
  Browser -->|":3001 API"| Backend
  Frontend -->|"NEXT_PUBLIC_PAYLOAD_URL"| Backend
  Backend -->|"DATABASE_URI"| Postgres
```

- One Docker network; backend connects to Postgres as `postgres:5432`.
- Host ports: frontend 3000, backend 3001, (optional) Postgres 5432 for tools.
- Env: provide `DATABASE_URI`, `PAYLOAD_SECRET`, `PAYLOAD_URL`, `FRONTEND_URL` to backend; `NEXT_PUBLIC_PAYLOAD_URL` to frontend (build-time, so use `http://localhost:3001` for browser).

## Implementation steps

### 1. Compose and env in `scripts/`

- **`scripts/docker-compose.yml`** (or `scripts/compose.yml`):
  - **postgres**: official `postgres:16-alpine` (or 15), env `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`; expose 5432 to host optionally; healthcheck.
  - **backend**: build context `../backend`, use existing [backend/Dockerfile](backend/Dockerfile); env from env file or compose `environment`; `depends_on: postgres` (with condition); ports `3001:3001`; `DATABASE_URI=postgresql://...@postgres:5432/<db>`.
  - **frontend**: build context `../frontend`; build args for `NEXT_PUBLIC_PAYLOAD_URL=http://localhost:3001` (so browser can hit backend); `depends_on: backend`; ports `3000:3000`.
  - Single named network for all three services.

- **`scripts/.env.example`**: Document all variables (e.g. `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `DATABASE_URI`, `PAYLOAD_SECRET`, `PAYLOAD_URL`, `FRONTEND_URL`, `NEXT_PUBLIC_PAYLOAD_URL`). Copy to `scripts/.env` for local use (gitignore `.env` only under `scripts/` or root).

- **`.gitignore`** (root): ensure `scripts/.env` (and optionally root `.env`) are ignored so secrets are not committed.

### 2. Frontend build-time API URL

- Next.js bakes `NEXT_PUBLIC_*` at build time. In compose, pass build arg into frontend Dockerfile. Current [frontend/Dockerfile](frontend/Dockerfile) does not declare `ARG NEXT_PUBLIC_PAYLOAD_URL`; we do **not** change their Dockerfile.
- Add a wrapper Dockerfile in `scripts/` (e.g. `scripts/frontend.Dockerfile`) that uses the same base, sets `ARG NEXT_PUBLIC_PAYLOAD_URL`, `ENV NEXT_PUBLIC_PAYLOAD_URL`, then runs the same build steps (copy from `../frontend`). Build context from repo root so COPY paths are `frontend/...`.

### 3. Backend env

- No code or Dockerfile changes in backend. In compose, set:
  - `DATABASE_URI=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}`
  - `PAYLOAD_SECRET` from env file
  - `PAYLOAD_URL=http://localhost:3001` (and optionally internal `http://backend:3001` if backend needs it)
  - `FRONTEND_URL=http://localhost:3000`
- Ensure backend starts only after Postgres is healthy (compose `depends_on` + healthcheck).

### 4. Postgres init (optional)

- If the app expects a specific DB name or extensions, add a small init script under `scripts/` (e.g. `scripts/postgres-init/01-init.sql`) and mount it as `/docker-entrypoint-initdb.d/`. Otherwise default user/password/db from env is enough.

### 5. Docs and change log

- **plan.md**: Update status checkboxes as each step is done.
- **change.md**: Log additions (compose, .env.example, frontend.Dockerfile, .gitignore, optional postgres init).
- **commands.md**: Add: copy `scripts/.env.example` to `scripts/.env`, edit secrets; from repo root run `docker compose -f scripts/docker-compose.yml up -d` (or `--build` first time); how to view logs and bring down.
- **readme.md**: Short "Quick start" with prereqs → copy env → compose up; link to commands.md and prerequisites.md.

## Files to add (all under root or `scripts/`)

| Path | Purpose |
|------|--------|
| `scripts/docker-compose.yml` | Postgres + backend + frontend services, network, env, build context/args. |
| `scripts/.env.example` | All variable names and example values (no real secrets). |
| `scripts/frontend.Dockerfile` | Wrapper Dockerfile to set `NEXT_PUBLIC_PAYLOAD_URL` at build time; build context repo root, copies `frontend/`. |
| Root `.gitignore` or `scripts/.gitignore` | Ignore `scripts/.env` (and root `.env` if used). |
| Optional: `scripts/postgres-init/01-init.sql` | DB init if needed. |

## What we do not change

- No edits under `frontend/` or `backend/` (no Dockerfiles, no next.config, no app code).
- Backend and frontend Dockerfiles stay as-is; we use backend's as-is and add a separate frontend wrapper in `scripts/` for build args.

## Order of work

1. Add `.gitignore` entry for `scripts/.env` (and root `.env` if present).
2. Add `scripts/.env.example` with all variables.
3. Add `scripts/docker-compose.yml` (postgres + backend + frontend; frontend build using `scripts/frontend.Dockerfile` and context repo root).
4. Add `scripts/frontend.Dockerfile` (inject `NEXT_PUBLIC_PAYLOAD_URL` at build).
5. Optionally add `scripts/postgres-init/01-init.sql` if a specific DB/schema is required.
6. Update plan.md, change.md, commands.md, readme.md.

## Status

- [x] Prerequisites script and docs in place
- [x] Docker Compose and PostgreSQL service added
- [x] Backend service wired to PostgreSQL
- [x] Frontend service wired to backend
- [x] Commands and readme updated
