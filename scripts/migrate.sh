#!/usr/bin/env bash
# Run Payload migrations in a Node 20 container (no host Node/pnpm needed; avoids Node 18 "File is not defined").
# Run from repo root. Uses scripts/.env.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "Ensuring postgres is up..."
docker compose -f scripts/docker-compose.yml --env-file scripts/.env up -d postgres

echo "Waiting for postgres..."
for i in $(seq 1 30); do
  if docker compose -f scripts/docker-compose.yml exec -T postgres pg_isready -U "${POSTGRES_USER:-payload}" -d "${POSTGRES_DB:-payload_db}" 2>/dev/null; then
    echo "Postgres is up."
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "Postgres did not become ready."
    exit 1
  fi
  sleep 1
done

echo "Running Payload migrations (in Docker, Node 20)..."
docker compose -f scripts/docker-compose.yml --env-file scripts/.env --profile tools run --rm migrate

echo "Migrations done."