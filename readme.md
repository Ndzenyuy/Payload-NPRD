# Payload + RDS PostgreSQL (EC2 container setup)

This repo runs the **Payload** backend (port 3001) and **Next.js** frontend (port 3000) in Docker containers on an EC2 instance. Database credentials are fetched from **AWS SSM Parameter Store** — no local PostgreSQL container is used. The shared RDS PostgreSQL instance is provisioned by the `Github-Repo-AWS-SharedServices-Infra` Terraform stack.

All orchestration and docs are at the repo root; the apps under `frontend/` and `backend/` are not modified.

## Contents

| File / folder      | Purpose |
|--------------------|--------|
| `scripts/`         | Scripts (prereq install, compose, helpers, SSM fetch). |
| `plan.md`          | Plan and status for this setup. |
| `change.md`        | Log of changes made. |
| `commands.md`      | Step-by-step commands for deployment, logs, and troubleshooting. |
| `readme.md`        | This file. |
| `prerequisites.md` | Prerequisites and how to install them. |

## Architecture

```
Browser
  ├── :3000 → Frontend (Next.js, Docker)
  └── :3001 → Backend (Payload CMS, Docker)
                └── DATABASE_URI → Shared RDS PostgreSQL (AWS, private subnet)
                    (credentials fetched from SSM Parameter Store)
```

The EC2 instance IAM role grants `ssm:GetParameter` access. No AWS credentials file is needed on the instance.

## Quick start (on the EC2 instance)

1. Install prerequisites (Docker, AWS CLI; script skips already-installed tools):

   ```bash
   chmod +x scripts/install-prereqs.sh
   ./scripts/install-prereqs.sh
   ```

2. Export SSM context and fetch credentials:

   ```bash
   export SSM_ENV=nonprod SSM_APP=testapp AWS_REGION=us-east-1
   ./scripts/fetch-ssm-env.sh
   ```

   This writes `scripts/.env` with `DATABASE_URI` and `PAYLOAD_SECRET` pulled from SSM.

3. Start the stack:

   ```bash
   ./scripts/up.sh
   ```

4. Open frontend at `http://<EC2-public-IP>:3000` and Payload admin at `http://<EC2-public-IP>:3001/admin`.

See [commands.md](commands.md) for logs, shutdown, migration, rebuild, and troubleshooting.

## Requirements

- Linux (Ubuntu/Debian or WSL2). See [prerequisites.md](prerequisites.md).
- EC2 instance must have an IAM role with `ssm:GetParameter` and `kms:Decrypt` on the SSM paths (provisioned by Terraform — see `Github-Repo-AWS-SharedServices-Infra`).
- AWS CLI installed on the EC2 instance (`scripts/install-prereqs.sh` handles this).
