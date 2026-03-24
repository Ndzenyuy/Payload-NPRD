# Project checklist

Track completed work and upcoming tasks. Update as you go.

---

## Container and stack setup

- **Compose and env:** `scripts/docker-compose.yml`, `scripts/.env.example`, `scripts/compose.sh`; stack runs with `./scripts/up.sh`
- **Frontend build:** Wrapper Dockerfile (`scripts/frontend.Dockerfile`) with `NEXT_PUBLIC_PAYLOAD_URL`; backend reachable at build time for `getStaticPaths`
- **Backend media:** Volume `backend_media` mounted at `/app/media`; startup chown so Payload can write uploads
- **Migrations in Docker:** Migrate service runs in container; no host Node required
- **Docs:** commands.md, readme.md, plan.md, change.md, prerequisites.md

---

## Frontend – new pages and content without rebuild

- `fallback: 'blocking'` in `frontend/src/pages/[[...slug]].js` so new pages (new slugs) work on first visit without rebuilding
- `PAYLOAD_API_URL` for server-side API calls so the frontend container can reach the backend in Docker (fixes "Page not found")
- **ISR** (`revalidate: 300`) so existing page content and images update without rebuild

---

## RDS and SSM — shared database

- [x] **Removed local postgres container** — backend connects to shared RDS PostgreSQL instance
- [x] **`scripts/fetch-ssm-env.sh`** — fetches `DATABASE_URI` and `PAYLOAD_SECRET` from SSM Parameter Store using EC2 IAM role; writes `scripts/.env`
- [x] **`scripts/docker-compose.yml`** updated — no postgres service or postgres_data volume
- [x] **`scripts/up.sh`** updated — calls `fetch-ssm-env.sh` before starting backend
- [x] **`scripts/migrate.sh`** updated — uses RDS `DATABASE_URI` from `.env`
- [x] **RDS connectivity:** EC2 security group rule `ec2_to_rds` provisioned by Terraform (`main.tf` in cha-testapp-infra)
- [x] **SSM paths documented:** `/{env}/{app}/db/uri` and `/{env}/{app}/payload/secret`

---

## Next / optional

- [x] **Build out team's Sample page** (slug `index`) with layout blocks and content
- [ ] **S3 for media:** Configure Payload to store and serve media from S3 instead of the local filesystem (`/app/media`)
- [ ] **EFS:** Evaluate EFS for shared media volume across multiple EC2 instances if needed
