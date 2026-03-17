#!/usr/bin/env bash
# Run docker compose for this project. Pass any compose subcommand and args.
# Examples: ./scripts/compose.sh up -d --build   ./scripts/compose.sh down   ./scripts/compose.sh logs -f
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
exec docker compose -f scripts/docker-compose.yml --env-file scripts/.env "$@"
