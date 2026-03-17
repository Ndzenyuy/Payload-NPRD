#!/usr/bin/env bash
# Rebuild the frontend image (with backend reachable) and restart the frontend container.
# Run from repo root: ./scripts/rebuild.sh
# Use after changing page content, layout blocks, or slugs in the backend.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

"$ROOT/scripts/build-frontend-with-backend.sh"
"$ROOT/scripts/compose.sh" -f scripts/compose.frontend-image.yml up -d --force-recreate frontend

echo "Frontend rebuilt and restarted. Open http://localhost:3000 and refresh."
