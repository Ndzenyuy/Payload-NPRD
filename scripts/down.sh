#!/usr/bin/env bash
# Tear down everything created by up.sh: containers, volumes, network, and the frontend image.
# Run from repo root: ./scripts/down.sh
# Pass --keep-image to skip removing the payload-frontend image.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

KEEP_IMAGE=
for arg in "$@"; do
  [ "$arg" = "--keep-image" ] && KEEP_IMAGE=1 && break
done

echo "Stopping and removing containers, volumes, and network..."
docker compose \
  -f scripts/docker-compose.yml \
  -f scripts/compose.frontend-image.yml \
  --env-file scripts/.env \
  down --volumes --remove-orphans

if [ -z "$KEEP_IMAGE" ] && docker image inspect payload-frontend &>/dev/null; then
  echo "Removing payload-frontend image..."
  docker image rm payload-frontend
fi

echo "Pruning dangling images..."
docker image prune -f

echo "Done. Run ./scripts/up.sh --build to start fresh."
