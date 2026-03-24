# Prerequisites

Tools required to run the Payload stack (frontend + backend) in containers on EC2, connected to the shared RDS PostgreSQL instance via SSM.

## Required

| Tool | Purpose | Skip condition |
|---|---|---|
| **Docker** | Run backend and frontend containers | `docker --version` succeeds |
| **Docker Compose** | Orchestrate multi-container stack | `docker compose version` succeeds |
| **AWS CLI** | Fetch credentials from SSM Parameter Store | `aws --version` succeeds |

## Optional (for local dev without containers)

| Tool | Purpose | Skip condition |
|---|---|---|
| **Node.js** | Run backend/frontend locally | `node --version` succeeds |
| **pnpm** | Install deps (backend/frontend use pnpm) | `pnpm --version` succeeds |

## Install script

- **Path:** `scripts/install-prereqs.sh`
- **Behavior:** Checks each prerequisite; installs if missing. Safe to run multiple times.
- **Platform:** Written for Linux (Ubuntu/Debian and WSL2).

```bash
chmod +x scripts/install-prereqs.sh
./scripts/install-prereqs.sh
```

## IAM permissions (EC2 instance role)

The EC2 instance must have an IAM role with the following permissions on the SSM paths used by the app:

```
ssm:GetParameter on arn:aws:ssm:<region>:*:parameter/{env}/{app}/*
kms:Decrypt      on the KMS key used for SecureString parameters
```

The Terraform app layer (`cha-testapp-infra`) attaches `AmazonSSMManagedInstanceCore` to the EC2 instance role, which covers these permissions. No credentials file is needed on the instance.

## Run Docker without sudo

If you see `permission denied while trying to connect to the docker API`:

```bash
sudo usermod -aG docker $USER
newgrp docker
```
