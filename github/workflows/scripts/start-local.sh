#!/usr/bin/env bash
set -euo pipefail

# Simple dev runner:
#  - starts backend local server in DEV_MODE (auth bypass)
#  - creates frontend/.env.local from .env.example (if missing) and sets VITE_API_URL
#  - installs deps (only if node_modules missing) and runs Vite dev server
#
# Usage:
#   chmod +x scripts/start-local.sh
#   ./scripts/start-local.sh

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
echo "Repo root: $ROOT_DIR"

# Start backend
echo "==> Preparing backend..."
cd "$ROOT_DIR/backend/functions"
if [ ! -f package.json ]; then
  echo "backend/functions package.json not found. Did you scaffold the repo?"
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Installing backend dependencies..."
  npm ci
fi

echo "Starting backend local server in DEV_MODE (logs -> backend/functions/dev.log)..."
nohup env DEV_MODE=true DEV_UID=dev-user node local-server.js > "$ROOT_DIR/backend/functions/dev.log" 2>&1 &
BACKEND_PID=$!
sleep 1
echo "Backend started with PID $BACKEND_PID"

cleanup() {
  echo "Stopping backend (PID $BACKEND_PID)..."
  kill $BACKEND_PID 2>/dev/null || true
  wait $BACKEND_PID 2>/dev/null || true
}
trap cleanup EXIT

# Start frontend
echo "==> Preparing frontend..."
cd "$ROOT_DIR/frontend"
if [ ! -f package.json ]; then
  echo "frontend package.json not found. Did you scaffold the repo?"
  exit 1
fi

if [ ! -f .env.local ]; then
  if [ -f .env.example ]; then
    cp .env.example .env.local
    echo "Created frontend/.env.local from .env.example"
  else
    touch .env.local
    echo "Created empty frontend/.env.local"
  fi
fi

if grep -q '^VITE_API_URL=' .env.local 2>/dev/null; then
  sed -i.bak "s|^VITE_API_URL=.*|VITE_API_URL=http://localhost:5001|" .env.local || true
else
  echo "VITE_API_URL=http://localhost:5001" >> .env.local
fi
echo "frontend/.env.local VITE_API_URL set to http://localhost:5001"

if [ ! -d node_modules ]; then
  echo "Installing frontend dependencies..."
  npm ci
fi

echo "Starting frontend (Vite). Press Ctrl+C to stop (this will also stop backend)..."
npm run dev
