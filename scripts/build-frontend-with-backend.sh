#!/usr/bin/env bash
# Build the frontend image with the backend reachable so getStaticPaths can fetch pages.
# Run from repo root. Start postgres + backend first, then run this script.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "Ensuring postgres and backend are up..."
docker compose -f scripts/docker-compose.yml --env-file scripts/.env up -d postgres backend

echo "Waiting for backend at http://localhost:3001..."
for i in {1..60}; do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api 2>/dev/null | grep -qE '^[0-9]+$'; then
    echo "Backend is up."
    break
  fi
  if [ "$i" -eq 60 ]; then
    echo "Backend did not become ready. Check: ./scripts/compose.sh logs backend"
    exit 1
  fi
  sleep 2
done

echo "Checking that backend has pages (need at least one with slug 'index' for homepage)..."
PAGES="$(curl -s "http://localhost:3001/api/pages?limit=5" 2>/dev/null || true)"
if ! echo "$PAGES" | grep -q '"docs"'; then
  echo "Warning: Could not fetch /api/pages. Build may still have no routes. Ensure backend is up and create a Page with slug 'index' in Payload admin."
fi

echo "Building frontend image (no cache; backend reachable at localhost:3001)..."
docker build --no-cache --network host -f scripts/frontend.Dockerfile -t payload-frontend . \
  --build-arg NEXT_PUBLIC_PAYLOAD_URL=http://localhost:3001

echo "Pruning dangling images (previous frontend build)..."
docker image prune -f

echo "Done. Restart frontend with the new image:"
echo "  ./scripts/compose.sh -f scripts/compose.frontend-image.yml up -d --force-recreate frontend"
