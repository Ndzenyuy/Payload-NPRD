# Prerequisites

Tools required to run the payload stack (frontend + backend + PostgreSQL) in containers. The install script **skips** any prerequisite that is already installed.

## Required (for containers)

| Tool             | Purpose                    | Skip condition                          |
|------------------|----------------------------|------------------------------------------|
| **Docker**       | Run PostgreSQL and apps    | `docker --version` succeeds              |
| **Docker Compose** | Orchestrate multi-container | `docker compose version` succeeds     |

## Optional (for local dev without containers)

| Tool    | Purpose              | Skip condition           |
|---------|----------------------|--------------------------|
| **Node.js** | Run backend/frontend | `node --version` succeeds |
| **pnpm**    | Install deps (backend/frontend use pnpm) | `pnpm --version` succeeds |

## Install script

- **Path:** `scripts/install-prereqs.sh`
- **Behavior:** For each prerequisite, checks if it is already available; if not, installs it. Safe to run multiple times.
- **Platform:** Written for Linux (Ubuntu/Debian and WSL2). Adapt for other distros if needed.

## Running the installer

From the repo root:

```bash
chmod +x scripts/install-prereqs.sh
./scripts/install-prereqs.sh
```

You may need `sudo` for Docker install (script will prompt if required).

## Run Docker without sudo

If you see `permission denied while trying to connect to the docker API at unix:///var/run/docker.sock`, your user is not in the `docker` group. Fix it once:

```bash
sudo usermod -aG docker $USER
```

Then either **log out and log back in** or run:

```bash
newgrp docker
```

After that, `docker ps` and other commands work without `sudo`. Re-running `scripts/install-prereqs.sh` will also add you to the group and print these steps if needed.
