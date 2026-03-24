# Commands to run

Commands for deploying and operating the Payload stack on EC2 with RDS PostgreSQL. Run from the repo root unless otherwise noted.

## Current state summary

- **Stack:** Payload backend (port 3001) + Next.js frontend (port 3000) in Docker. Database is the shared RDS PostgreSQL instance — credentials fetched from AWS SSM Parameter Store.
- **No local postgres container.** `DATABASE_URI` and `PAYLOAD_SECRET` come from SSM (written by the Terraform Lambda DB init in `Github-Repo-AWS-SharedServices-Infra`).
- **Backend:** Payload CMS admin at `http://<EC2-IP>:3001/admin`.
- **Frontend:** Next.js at `http://<EC2-IP>:3000`. Homepage requires a page with slug `index` in Payload admin.
- **One-command start:** `./scripts/up.sh` (fetches SSM credentials, starts backend, builds and starts frontend).

---

## Prerequisites (one-time, on the EC2 instance)

```bash
chmod +x scripts/install-prereqs.sh
./scripts/install-prereqs.sh
```

This installs Docker, Docker Compose, and AWS CLI (skips any already installed).

If you see **permission denied** when running `docker` without sudo:

```bash
sudo usermod -aG docker $USER
newgrp docker
```

---

## Step 1 — Ensure Terraform infrastructure is deployed

Before running anything here, the shared infrastructure must be deployed from `Github-Repo-AWS-SharedServices-Infra`:

1. **Layer 1 (Shared-Services):** VPC, RDS, ECS cluster — deployed once per environment.
2. **Layer 2 (cha-testapp-infra):** Lambda DB init runs automatically at end of `terraform apply` and writes these SSM parameters:

   | SSM Path | Contains |
   |---|---|
   | `/{env}/{app}/db/uri` | Full `postgresql://` URI (`DATABASE_URI`) |
   | `/{env}/{app}/payload/secret` | Payload CMS secret key (`PAYLOAD_SECRET`) |

   Verify they exist:
   ```bash
   aws ssm get-parameter --name /nonprod/testapp/db/uri --with-decryption --region us-east-1
   aws ssm get-parameter --name /nonprod/testapp/payload/secret --with-decryption --region us-east-1
   ```

---

## Step 2 — Fetch credentials from SSM

On the EC2 instance, export the SSM context and run the fetch script:

```bash
export SSM_ENV=nonprod
export SSM_APP=testapp
export AWS_REGION=us-east-1

./scripts/fetch-ssm-env.sh
```

This writes `scripts/.env` with `DATABASE_URI`, `PAYLOAD_SECRET`, and supporting values. Re-run any time credentials change (e.g. after a Terraform re-apply).

**For production:**
```bash
export SSM_ENV=prod SSM_APP=testapp AWS_REGION=us-east-1
./scripts/fetch-ssm-env.sh
```

---

## Step 3 — Run Payload migrations (first deploy only)

Migrations create the Payload tables (`users`, `pages`, etc.) in the RDS database. Run once after the first `terraform apply` of Layer 2, or after a clean database.

```bash
./scripts/migrate.sh
```

This runs `pnpm payload migrate` inside a Node 20 container using the `DATABASE_URI` from `scripts/.env`. No host Node is required.

---

## Step 4 — Start the stack

```bash
./scripts/up.sh
```

What it does:
1. Fetches credentials from SSM (calls `fetch-ssm-env.sh`)
2. Starts the backend container
3. Waits for backend to be ready
4. Builds the frontend image (if not already built)
5. Starts the frontend container

Use `./scripts/up.sh --build` to force a frontend image rebuild.

Open in the browser:
- Frontend: `http://<EC2-public-IP>:3000`
- Backend (Payload admin): `http://<EC2-public-IP>:3001/admin`

---

## View logs

```bash
./scripts/compose.sh logs -f
./scripts/compose.sh logs --tail=100 backend
./scripts/compose.sh logs --tail=100 frontend
```

---

## Stop the stack

```bash
./scripts/compose.sh down
```

---

## Start again after shutdown

```bash
export SSM_ENV=nonprod SSM_APP=testapp AWS_REGION=us-east-1
./scripts/up.sh
```

Or quick start (skip SSM fetch if `.env` is still valid):
```bash
./scripts/compose.sh -f scripts/compose.frontend-image.yml up -d
```

---

## Rebuild the frontend

Required only when frontend code or build-time env changes:

```bash
./scripts/rebuild.sh
```

Or manually:
```bash
./scripts/build-frontend-with-backend.sh
./scripts/compose.sh -f scripts/compose.frontend-image.yml up -d --force-recreate frontend
```

---

## Troubleshooting

### Backend: "Application error: a server-side exception has occurred"

1. Check backend logs:
   ```bash
   ./scripts/compose.sh logs backend
   ```

2. Verify `DATABASE_URI` in `scripts/.env` is correct and the RDS instance is reachable from the EC2 instance (security group `ec2_to_rds` rule must be in place — provisioned by Terraform).

3. Verify `PAYLOAD_SECRET` is at least 32 characters.

4. Re-fetch from SSM if in doubt:
   ```bash
   export SSM_ENV=nonprod SSM_APP=testapp AWS_REGION=us-east-1
   ./scripts/fetch-ssm-env.sh
   ./scripts/compose.sh up -d --force-recreate backend
   ```

### Backend: "relation \"users\" does not exist"

Payload tables were never created. Run migrations:

```bash
./scripts/migrate.sh
./scripts/compose.sh up -d --force-recreate backend
```

### fetch-ssm-env.sh: "An error occurred (AccessDeniedException)"

The EC2 IAM role does not have permission to read the SSM parameters. Verify:
- The instance profile is attached (check in EC2 console → IAM role)
- The Terraform app layer was applied (`aws_iam_role_policy_attachment.ec2_ssm` attaches `AmazonSSMManagedInstanceCore`)
- The SSM parameters exist under `/{SSM_ENV}/{SSM_APP}/`

### fetch-ssm-env.sh: "ParameterNotFound"

The Terraform Lambda DB init has not run yet. Deploy Layer 2 of the infra repo first:
```bash
cd Terraform/App-Layer/cha-testapp-infra
terraform workspace select nonprod
terraform apply
```

### Backend cannot reach RDS

The EC2 security group rule `ec2_to_rds` (in `main.tf`) allows the EC2 instance to reach RDS on port 5432. If this rule is missing, re-apply the Terraform app layer. Verify connectivity:
```bash
# From the EC2 instance (replace with your RDS endpoint)
nc -zv <rds-endpoint> 5432
```

### Frontend: 404 "This page could not be found"

1. Create a page with slug `index` in Payload admin (`http://<EC2-IP>:3001/admin` → Collections → Pages).
2. Rebuild the frontend:
   ```bash
   ./scripts/rebuild.sh
   ```

### Media: paste S3 URL — "blocked by CORS policy"

Add CORS to the S3 bucket allowing your EC2 admin origin (`http://<EC2-IP>:3001`). See the S3 bucket CORS configuration example in the previous version of this file or the AWS S3 console.

---

## Page and slug model

| Page name | Slug | URL |
|---|---|---|
| Home | `index` | `http://<EC2-IP>:3000/` |
| Hero | `hero` | `http://<EC2-IP>:3000/hero` |
| About | `about` | `http://<EC2-IP>:3000/about` |

New pages created in Payload admin are available on first visit without a frontend rebuild (`fallback: 'blocking'`). Content updates appear within 5 minutes (ISR `revalidate: 300`).
