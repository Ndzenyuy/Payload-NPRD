# Project checklist

Track completed work and upcoming tasks. Update as you go.

---

## Container and stack setup

- **Compose and env:** `scripts/docker-compose.yml`, `scripts/.env.example`, `scripts/compose.sh`; stack runs with `./scripts/up.sh`
- **Frontend build:** Wrapper Dockerfile (`scripts/frontend.Dockerfile`) with `NEXT_PUBLIC_PAYLOAD_URL`; backend reachable at build time for `getStaticPaths`
- **Backend media:** Volume `backend_media` mounted at `/app/media`; startup chown so Payload can write uploads
- **Backend media – permission fix:** If uploads fail, run `chown -R nextjs:nodejs /app/media` and `/app/public` (see [commands.md](commands.md))
- **Migrations in Docker:** Migrate service runs in container; no host Node required
- **Docs:** commands.md, readme.md, plan.md, change.md, prerequisites.md

---

## Frontend – new pages and content without rebuild

- `**fallback: 'blocking'`** in `frontend/src/pages/[[...slug]].js` so new pages (new slugs) work on first visit without rebuilding
- `**PAYLOAD_API_URL**` for server-side API calls so the frontend container can reach the backend in Docker (fixes “Page not found”)
- **ISR** (`revalidate: 300`) so existing page content and images update without rebuild
- **Documentation:** commands.md updated with no-rebuild behavior, chown fix, and when to rebuild

---

## Next / optional

- [x] **Build out team's Sample page** (slug `index`) with layout blocks and content (see [commands.md](commands.md#populating-the-frontend-page-adding-content-via-the-backend))

---

## RDS and EFS – connectivity and audit

- [ ] **RDS:** Connection/access verified (endpoint, security groups, VPC); connectivity from app noted
- [ ] **RDS:** Instance list and regions documented
- [ ] **RDS:** Instance class, storage, and backup/retention reviewed (see Phase 3)
- [ ] **EFS:** Connection/access verified (mount targets, NFS, access points)
- [ ] **EFS:** File systems listed by region; usage and throughput mode documented
- [ ] **EFS:** Cost and optimization (lifecycle, Infrequent Access) reviewed
- [ ] **Deployment:** Implement this project to use ECS rather than EC2 in both scenarios (RDS connectivity and EFS connectivity)

---

## Media storage with S3 (instead of Payload local uploads)

- [x] **Paste S3 URL in admin:** `pasteURL.allowList` in `backend/src/collections/Media.ts` for S3 host; add CORS on the bucket for admin origin (see [commands.md](commands.md#media-paste-s3-url--blocked-by-cors-policy--failed-to-fetch-the-file))
- [x] **Frontend shows media:** TwoColumn (and Hero) resolve image URLs (relative/localhost → `NEXT_PUBLIC_PAYLOAD_URL`); `frontend/next.config.mjs` allows backend and S3 in `images.remotePatterns`
- [ ] **S3 for media:** Configure Payload to store and serve media from S3 instead of the local filesystem (`/app/media`)
- [ ] **S3 bucket:** Create and document bucket (region, name); CORS documented in commands.md
- [ ] **Payload S3 adapter:** Integrate S3 storage adapter (or plugin) in the backend Media collection
- [ ] **Env and IAM:** Set bucket name and credentials (env vars / IAM role); ensure backend has read/write access
- [ ] **URLs and frontend:** Media URLs point to S3 (or CloudFront); Next.js image domains already updated for current S3 bucket
- [ ] **Migration (optional):** Plan to move existing uploads from local/EFS to S3 if applicable
