# Commands to run

Commands you need to run for this setup. Run from the repo root unless otherwise noted.

## Current state summary

- **Stack:** Postgres + Payload backend (port 3001) + Next.js frontend (port 3000), all in Docker. One-command start: `./scripts/up.sh`.
- **Backend:** Working. Admin at http://localhost:3001/admin. Users and Pages collections in use. Migrations run in a Node 20 container (no host Node needed).
- **Frontend:** Working once a page with slug `index` exists and the frontend image is built with the backend reachable. Homepage shows content from that page (e.g. “Vin Sample” with ANTIGRAVITY).
- **Docs:** [commands.md](commands.md) (this file), [readme.md](readme.md), [plan.md](plan.md), [change.md](change.md), [prerequisites.md](prerequisites.md).
- **Docker image cleanup:** After each frontend rebuild (`./scripts/rebuild.sh` or `./scripts/up.sh --build`), dangling images are pruned automatically so the previous frontend image does not accumulate on disk.

## Prerequisites (one-time)

```bash
# Make the install script executable and run it (skips already-installed tools)
chmod +x scripts/install-prereqs.sh
./scripts/install-prereqs.sh
```

If Docker was already installed and you get **permission denied** when running `docker` without sudo:

```bash
sudo usermod -aG docker $USER
# Then log out and back in, or run:
newgrp docker
```

## Start the stack (PostgreSQL + backend + frontend)

1. Copy the example env file and set at least `PAYLOAD_SECRET` (and optionally `POSTGRES_PASSWORD`):

   ```bash
   cp scripts/.env.example scripts/.env
   # Edit scripts/.env and set PAYLOAD_SECRET to a secure value (min 32 chars).
   ```

2. Start everything with one command (starts postgres, runs Payload migrations to create tables, then backend, then frontend):

   ```bash
   ./scripts/up.sh
   ```

   First run builds the frontend image; later runs reuse it. Use `./scripts/up.sh --build` to force rebuild the frontend.  
   Migrations run inside Docker (Node 20), so you don't need Node/pnpm on the host for them.

3. Open in the browser:

   - Frontend: http://localhost:3000  
   - Backend (Payload admin): http://localhost:3001/admin  

4. View logs:

   ```bash
   ./scripts/compose.sh logs -f
   ```

   **Capture specific logs (for sharing or debugging):**
   - Last N lines of one service: `./scripts/compose.sh logs --tail=100 backend`
   - Last N lines of all: `./scripts/compose.sh logs --tail=50`
   - Only lines matching error/exception/fail: `./scripts/compose.sh logs --tail=150 backend 2>&1 | grep -i -E 'error|exception|fail'`
   - Save to file: `./scripts/compose.sh logs --tail=200 backend > backend-logs.txt 2>&1`
   - Logs from last 5 minutes: `./scripts/compose.sh logs --since 5m backend`
   - Show and save: `./scripts/compose.sh logs --tail=100 backend 2>&1 | tee backend-logs.txt`

5. Stop and remove containers:

   ```bash
   ./scripts/compose.sh down
   ```

   To also remove the Postgres data volume: `./scripts/compose.sh down -v`

## Start again after shutdown

After you shut down your PC, containers stop but data (and the frontend image) stay. From the repo root:

**Full start (same as first time):**
```bash
./scripts/up.sh
```

**Quick start (containers only, no migrate or rebuild):**
```bash
./scripts/compose.sh -f scripts/compose.frontend-image.yml up -d
```

Then open http://localhost:3000 (frontend) and http://localhost:3001/admin (Payload).

## Clean state (fresh start)

If you hit migration errors, "File is not defined", or want a clean DB and images:

```bash
# Stop all containers and remove Postgres data
./scripts/compose.sh down -v

# Optional: remove the frontend image so it rebuilds next time
docker rmi payload-frontend 2>/dev/null || true

# Start again (postgres, migrate, backend, frontend)
./scripts/up.sh
```

## Troubleshooting

### Backend: "Application error: a server-side exception has occurred"

1. **Check backend logs** for the real error:
   ```bash
   ./scripts/compose.sh logs backend
   ```

2. **Set a real PAYLOAD_SECRET** (min 32 chars). The placeholder can cause errors. Generate one:
   ```bash
   openssl rand -base64 32
   ```
   Put the output in `scripts/.env` as `PAYLOAD_SECRET=<paste>`, then restart:
   ```bash
   ./scripts/compose.sh up -d --force-recreate backend
   ```

3. **Database**: Ensure Postgres is healthy and credentials in `scripts/.env` match `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`. Backend uses `DATABASE_URI=postgresql://...@postgres:5432/...` (compose sets this automatically).

### Backend: "relation \"users\" does not exist" (or "pages" does not exist)

The database exists but Payload tables were never created. Run migrations from the repo root:

```bash
./scripts/migrate.sh
```

Then restart the backend: `./scripts/compose.sh up -d --force-recreate backend`.  
Or run **`./scripts/up.sh`** once; it runs migrations before starting the backend.

### Frontend: 404 "This page could not be found"

1. **Homepage needs a page with slug `index`**  
   In Payload admin → Collections → Pages, create (or edit) a page and set **slug** to exactly `index`. The app maps `/` to that slug.

2. **Rebuild frontend with no cache and restart** (backend must be up and have pages): run **`./scripts/rebuild.sh`**, or the two commands:
   ```bash
   ./scripts/build-frontend-with-backend.sh
   ./scripts/compose.sh -f scripts/compose.frontend-image.yml up -d --force-recreate frontend
   ```
   The build uses `--no-cache` so the frontend fetches pages from the API. Use `--force-recreate frontend` so the running container uses the new image.

### Media: paste S3 URL – "blocked by CORS policy" / "Failed to fetch the file"

When you paste an S3 image URL in Payload admin (Creating new Media), the browser fetches that URL from your admin origin (e.g. `http://18.215.146.52:3001`). S3 must allow that origin via **CORS**, or the browser blocks the response and you see:

`Access to fetch at 'https://...s3...amazonaws.com/...' from origin 'http://...' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.`

**Fix: add CORS to the S3 bucket**

1. Open **AWS Console** → **S3** → your bucket (e.g. `payload-test-dev`) → **Permissions** → **Cross-origin resource sharing (CORS)** → **Edit**.
2. Use a configuration that allows your Payload admin origin (and optionally the frontend). Example:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": [
      "http://18.215.146.52:3001",
      "http://localhost:3001",
      "http://localhost:3000"
    ],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3600
  }
]
```

3. Replace or add your actual admin URL (e.g. `https://your-admin.example.com` if you use HTTPS). Add any other origins that need to load images (e.g. frontend at `:3000`).
4. Save. Then try pasting the S3 URL again in Payload admin.

The Media collection already has `pasteURL.allowList` for `payload-test-dev.s3.us-east-1.amazonaws.com` in `backend/src/collections/Media.ts`; CORS is still required because the admin runs the fetch in the browser.

**Media on the frontend (e.g. /about):** After adding media (paste S3 URL or upload), images appear on pages because:
- **Hero** and **TwoColumn** resolve image URLs: relative paths and localhost backend URLs use `NEXT_PUBLIC_PAYLOAD_URL` (e.g. `http://18.215.146.52:3001`); full S3 or backend URLs are used as-is.
- **Next.js** `frontend/next.config.mjs` allows the backend host and S3 bucket (`payload-test-dev.s3.us-east-1.amazonaws.com`) in `images.remotePatterns` for `next/image` if used.
- Set `NEXT_PUBLIC_PAYLOAD_URL` at frontend build time to match how users reach the backend (e.g. `http://18.215.146.52:3001`). Rebuild the frontend after changing it so media URLs resolve correctly.

## Known issues / Next steps

- **Backend: image upload**  
  The backend container mounts a writable volume at `/app/media` (Payload’s default upload dir) and sets ownership on startup. Restart the backend once so the volume and command apply:  
  `./scripts/compose.sh up -d --force-recreate backend`  
  Then try creating Media again (Select a file, set Alt, Save).

  **If uploads still fail (e.g. permission denied),** fix ownership from the repo root. From `scripts/`:

  ```bash
  cd scripts
  docker compose -f docker-compose.yml --env-file .env exec -u root backend chown -R nextjs:nodejs /app/media
  docker compose -f docker-compose.yml --env-file .env exec -u root backend chown -R nextjs:nodejs /app/public
  ```

  Or from repo root with compose.sh:  
  `./scripts/compose.sh exec -u root backend chown -R nextjs:nodejs /app/media`  
  `./scripts/compose.sh exec -u root backend chown -R nextjs:nodejs /app/public`

- **Frontend: new pages and content without rebuild**  
  The frontend uses **`fallback: 'blocking'`** in `frontend/src/pages/[[...slug]].js` so **new pages** (new slugs) created in Payload are generated on first request and do **not** require a frontend rebuild. Page content and images use **ISR** (`revalidate: 300`), so edits and new pictures appear without rebuild (within the revalidate window).  
  Server-side API calls use **`PAYLOAD_API_URL`** (e.g. `http://backend:3001` in Docker) so the frontend container can reach the backend; this fixes "Page not found" when running in Docker. See `scripts/.env.example` for `PAYLOAD_API_URL`.

- **Next: build out the Vin Sample page** — See **Populating the frontend page** below.

---

## Populating the frontend page (adding content via the backend)

The homepage at http://localhost:3000 is driven by the Payload page with **slug `index`** (e.g. "Vin Sample"). You add and edit all content in the **backend admin**. With the current setup, **new pages** and **content/picture updates** appear **without rebuilding** the frontend (see **Fixes applied** below).

### Fixes applied (no-rebuild behavior)

- **`fallback: 'blocking'`** in `frontend/src/pages/[[...slug]].js`: new pages (new slugs) are generated on first request, so you do **not** need to rebuild after creating a page in Payload.
- **`PAYLOAD_API_URL`**: the frontend container uses this (e.g. `http://backend:3001`) for server-side API calls so the backend is reachable in Docker; avoids "Page not found" when the frontend runs in a container.
- **ISR** (`revalidate: 300`): existing page content and images are re-fetched periodically, so edits and new pictures show without a rebuild (within the revalidate window).

You only need to **rebuild** the frontend if you change frontend code or build-time env (e.g. `NEXT_PUBLIC_*`).

### Page and slug model (recommended setup)

Use **one primary page with slug `index`** for the homepage, and give every other page its **own slug**. The frontend maps each slug to a URL. Keep only one page with slug `index` so the homepage is predictable.

| Page name (example) | Slug    | URL                     | Role |
|--------------------|--------|-------------------------|------|
| Home / Primary     | `index`| http://localhost:3000/  | Proves frontend talks to backend; can be minimal or a simple landing. |
| Hero               | `hero` | http://localhost:3000/hero  | Build and demo hero layout here. |
| About              | `about`| http://localhost:3000/about | Same idea: own slug, own layout. |

- **One page with slug `index`** → homepage works; the app is wired to the backend.
- **Other pages** each have a **unique slug** → predictable URLs: `/hero`, `/about`, etc. Create pages in Payload admin, set the slug, add Layout blocks; the new route is available on first visit (no rebuild).

### Step 1: Add content in the backend

1. Open **http://localhost:3001/admin** and log in.
2. **Optional – add images first:**  
   **Collections** → **Media** → **Create New** → choose a file (or Paste URL), set **Alt** (required), Save. You can use these in Hero and Two Column blocks later.
3. **Edit the homepage:**  
   **Collections** → **Pages** → open the page with **slug `index`** (e.g. "Vin Sample").
4. In **Layout**, click **Add Layout** and pick a block. Fill in the fields. You can add several blocks; they appear in order on the frontend.
5. **Save** the page.

### Layout block types

| Block | Use for | Fields |
|-------|---------|--------|
| **Hero Block** | Top banner (title, tagline, CTAs) | **Title**, **Text**, **Primary Button Label**, **Secondary Button Label**, **Background Image** (choose from Media). |
| **Two Column Block** | Section with heading + text + image | **Heading**, **Text**, **Image** (choose from Media), **Direction** (Default = image on right; Reverse = image on left). |

You can leave images empty; title, text, and buttons still show.

### Step 2: Make the frontend show the new content

With the current setup, **new pages** and **content/photo updates** appear **without rebuilding**: new slugs work on first visit (`fallback: 'blocking'`), and existing pages refresh via ISR. Just open or refresh **http://localhost:3000**.

**When to rebuild the frontend** (only if you change frontend code or build-time env):

**Option A – one script (recommended):**
```bash
chmod +x scripts/rebuild.sh   # only needed once
./scripts/rebuild.sh
```

**Option B – run the two commands yourself:**
```bash
./scripts/build-frontend-with-backend.sh
./scripts/compose.sh -f scripts/compose.frontend-image.yml up -d --force-recreate frontend
```
