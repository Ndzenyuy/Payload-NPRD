#!/usr/bin/env bash
# Run Payload migrations against the shared RDS instance.
# DATABASE_URI is read from scripts/.env (fetched from SSM by fetch-ssm-env.sh).
# Run from repo root. Ensure scripts/.env exists (run fetch-ssm-env.sh first).
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ ! -f "$ROOT/scripts/.env" ]; then
  echo "scripts/.env not found. Run ./scripts/fetch-ssm-env.sh first."
  exit 1
fi

echo "Running Payload migrations against RDS (in Docker, Node 20)..."
docker compose -f scripts/docker-compose.yml --env-file scripts/.env --profile tools run --rm migrate

echo "Migrations done."
