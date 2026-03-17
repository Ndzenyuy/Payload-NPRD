# Payload + PostgreSQL (local container setup)

This repo runs the **payload** frontend and backend together with **PostgreSQL** in containers. All orchestration and docs are at the repo root; the apps under `frontend/` and `backend/` are not modified.

## Contents

| File / folder      | Purpose |
|--------------------|--------|
| `scripts/`         | Scripts (prereq install, compose, helpers). |
| `plan.md`          | Plan and status for this setup. |
| `change.md`        | Log of changes we make. |
| `commands.md`      | Commands to run (prereqs, compose, etc.). |
| `readme.md`        | This file. |
| `prerequisites.md` | List of prerequisites and how they are installed. |

## Quick start

1. Install prerequisites (Docker, Docker Compose; script skips if already installed):

   ```bash
   chmod +x scripts/install-prereqs.sh
   ./scripts/install-prereqs.sh
   ```

2. Copy env and start the stack:

   ```bash
   cp scripts/.env.example scripts/.env
   # Edit scripts/.env and set PAYLOAD_SECRET (min 32 chars).
   ./scripts/up.sh
   ```

3. Open frontend at http://localhost:3000 and Payload admin at http://localhost:3001/admin. See [commands.md](commands.md) for logs, shutdown, troubleshooting, and the **page/slug model** (one `index` page for home, other pages with unique slugs like `/hero`, `/about`).

**See commands.md** for troubleshooting, the page/slug model, and media: image upload (writable volume), paste S3 URL (CORS on bucket), and frontend display (URL resolution in Hero/TwoColumn, next.config).

## Requirements

- Linux (e.g. Ubuntu/Debian or WSL2). See `prerequisites.md` for details.
- To run Docker without sudo, add your user to the `docker` group (see [prerequisites.md](prerequisites.md#run-docker-without-sudo)).
