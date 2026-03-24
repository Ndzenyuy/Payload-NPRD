#!/usr/bin/env bash
# One command to start the full stack: fetch RDS credentials from SSM, start backend, then frontend.
# Run from repo root: ./scripts/up.sh
# Use ./scripts/up.sh --build to force rebuild the frontend image.
#
# Prerequisites:
#   - AWS CLI installed and configured (or running on EC2 with an IAM instance role)
#   - SSM_ENV, SSM_APP, AWS_REGION exported (or set in your shell)
#     e.g.: export SSM_ENV=nonprod SSM_APP=testapp AWS_REGION=us-east-1
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

FORCE_BUILD=
for arg in "$@"; do
  [ "$arg" = "--build" ] && FORCE_BUILD=1 && break
done

echo "Fetching credentials from SSM..."
"$ROOT/scripts/fetch-ssm-env.sh"

echo "Starting backend..."
docker compose -f scripts/docker-compose.yml --env-file scripts/.env up -d backend

echo "Waiting for backend at http://localhost:3001..."
for i in $(seq 1 60); do
  code="$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3001/api 2>/dev/null || true)"
  if [ -n "$code" ] && [ "$code" != "000" ]; then
    echo "Backend is up."
    break
  fi
  if [ "$i" -eq 60 ]; then
    echo "Backend did not become ready. Check: ./scripts/compose.sh logs backend"
    exit 1
  fi
  sleep 2
done

if [ -n "$FORCE_BUILD" ] || ! docker image inspect payload-frontend &>/dev/null; then
  echo "Building frontend image (backend reachable at localhost:3001)..."
  docker build --network host -f scripts/frontend.Dockerfile -t payload-frontend . \
    --build-arg NEXT_PUBLIC_PAYLOAD_URL=http://localhost:3001
  echo "Pruning dangling images (previous frontend build)..."
  docker image prune -f
else
  echo "Using existing frontend image (use --build to rebuild)."
fi

echo "Starting frontend and ensuring all services are up..."
docker compose -f scripts/docker-compose.yml -f scripts/compose.frontend-image.yml --env-file scripts/.env up -d

echo "Done. Frontend: http://localhost:3000  Admin: http://localhost:3001/admin"
