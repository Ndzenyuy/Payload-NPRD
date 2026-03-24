# Change log

All changes made for running Payload + PostgreSQL in containers. No edits to the project's own files under `frontend/` or `backend/` (except where explicitly noted).

| Date      | What changed |
| --------- | ------------ |
| (initial) | Created `scripts/`, `plan.md`, `change.md`, `commands.md`, `readme.md`, `prerequisites.md`, and `scripts/install-prereqs.sh` (skips existing Docker, Docker Compose, Node, pnpm). |
| (update)  | Docker without sudo: added `fix_docker_socket_permissions()` to install script; documented in prerequisites.md, commands.md, readme.md. |
| (impl)    | Container setup: root .gitignore; scripts/.env.example; scripts/docker-compose.yml (postgres, backend, frontend); scripts/frontend.Dockerfile; updated plan.md, change.md, commands.md, readme.md. |
| (script)  | Added scripts/compose.sh to run docker compose with -f and --env-file; updated commands.md and readme.md. |
| (fix)     | Troubleshooting: backend server error (logs, PAYLOAD_SECRET, DB); frontend 404 (build-time API). Added scripts/build-frontend-with-backend.sh, scripts/compose.frontend-image.yml, and troubleshooting section in commands.md. |
| (up)      | Single command: added scripts/up.sh. Run ./scripts/up.sh to start postgres, backend, wait, build frontend, then start frontend. Updated commands.md and readme.md. |
| (migrate) | Added scripts/migrate.sh to run Payload migrations (creates users, pages, etc.). up.sh now runs migrate after postgres and before backend. Troubleshooting for "relation users does not exist" in commands.md. |
| (clean)   | Migrations now run in Docker (Node 20) via scripts/backend-migrate.Dockerfile and compose "migrate" service; no host Node needed, fixes "File is not defined". Added "Clean state" to commands.md. |
| (doc)     | Documented current state summary, frontend 404 fix (index slug, no-cache build, force-recreate). Known issues: backend image upload failing (to fix later). Next: build out Vin Sample page. Updated commands.md, readme.md. |
| (upload)  | Image upload fix: backend service now mounts volume backend_media at /app/media and runs init (chown to nextjs) so Payload can write uploads. Updated commands.md, readme.md. |
| (rds-ssm) | **Removed local postgres container.** Backend now connects to the shared RDS PostgreSQL instance provisioned by `Github-Repo-AWS-SharedServices-Infra`. Added `scripts/fetch-ssm-env.sh` to pull `DATABASE_URI` and `PAYLOAD_SECRET` from AWS SSM Parameter Store using the EC2 IAM instance role. Updated `scripts/docker-compose.yml` (removed postgres service and postgres_data volume), `scripts/.env.example`, `scripts/up.sh`, `scripts/migrate.sh`. Updated all docs: readme.md, commands.md, plan.md, change.md, CHECKLIST.md, prerequisites.md. |
