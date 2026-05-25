#!/usr/bin/env bash
set -euo pipefail

# Dev helper: start local Postgres (if not running on expected port), run migrations, seed,
# start API in background and start frontend in foreground.
# Usage: ./scripts/dev-local.sh

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API_DIR="$REPO_ROOT/artifacts/api-server"
FRONTEND_ROOT="$REPO_ROOT"
CONTAINER_NAME="${CONTAINER_NAME:-leaf-postgres-5433}"

# Config - change if your local DB differs
DB_USER="${DB_USER:-leaf}"
DB_PASS="${DB_PASS:-leaf}"
DB_NAME="${DB_NAME:-leaf}"
DB_PORT="${DB_PORT:-5433}"
API_PORT="${API_PORT:-3001}"
WEB_PORT="${WEB_PORT:-5174}"

export DATABASE_URL="postgres://$DB_USER:$DB_PASS@localhost:$DB_PORT/$DB_NAME"

echo "Using DATABASE_URL=$DATABASE_URL"

echo "Starting (or reusing) Postgres container '$CONTAINER_NAME'..."
if docker ps --filter "name=^${CONTAINER_NAME}$" --format '{{.Names}}' | grep -q .; then
  echo "Postgres container already running"
elif docker ps -a --filter "name=^${CONTAINER_NAME}$" --format '{{.Names}}' | grep -q .; then
  docker start "$CONTAINER_NAME" >/dev/null
  echo "Postgres container restarted"
else
  docker run --name "$CONTAINER_NAME" \
    -e POSTGRES_USER="$DB_USER" \
    -e POSTGRES_PASSWORD="$DB_PASS" \
    -e POSTGRES_DB="$DB_NAME" \
    -p "$DB_PORT:5432" \
    -d postgres:15 >/dev/null
  echo "Postgres launched on localhost:$DB_PORT"
fi

echo "Waiting for Postgres to become ready..."
for _ in $(seq 1 30); do
  if docker exec "$CONTAINER_NAME" pg_isready -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; then
    echo "Postgres is ready"
    break
  fi
  sleep 1
done

if ! docker exec "$CONTAINER_NAME" pg_isready -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; then
  echo "Postgres did not become ready in time"
  exit 1
fi

echo "Running Drizzle migrations (push)..."
cd "$REPO_ROOT"
DATABASE_URL="$DATABASE_URL" pnpm --filter @workspace/db run push

echo "Seeding plants..."
DATABASE_URL="$DATABASE_URL" pnpm --filter @workspace/scripts run seed:plants

echo "Starting API in background on port $API_PORT (logs -> api.log)..."
cd "$API_DIR"
nohup env \
  PORT="$API_PORT" \
  DATABASE_URL="$DATABASE_URL" \
  pnpm run dev > "$REPO_ROOT/api.log" 2>&1 &
sleep 2

echo "Starting frontend on port $WEB_PORT (foreground)..."
cd "$FRONTEND_ROOT"
PORT="$WEB_PORT" VITE_API_BASE_URL="http://localhost:$API_PORT" pnpm --filter @workspace/leafline dev
