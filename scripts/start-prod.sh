#!/usr/bin/env bash
# Start both the Django API server and the Node.js middleware in a single dyno.
#
# Heroku assigns the value of PORT for the external web traffic. We bind
# the Node.js server to this port, and run the Django application on an
# internal port (8000). The middleware proxies API requests to Django.

set -euo pipefail

# Navigate to the repository root
REPO_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

cd "$REPO_DIR"

echo "[start-prod] Running Django migrations..."
python backend/manage.py migrate --no-input

echo "[start-prod] Starting Django API on port 8000..."
gunicorn core.wsgi:application --pythonpath backend --bind 0.0.0.0:8000 &

NEXT_PORT="${NEXT_PORT:-3001}"
export NEXT_FRONTEND_URL="http://127.0.0.1:${NEXT_PORT}"

if [ ! -d "frontend/.next" ]; then
  echo "[start-prod] Building Next.js frontend..."
  npm run build --prefix frontend
else
  echo "[start-prod] Using prebuilt Next.js frontend in frontend/.next..."
fi

echo "[start-prod] Starting Next.js frontend on port ${NEXT_PORT}..."
npm run start --prefix frontend -- --hostname 0.0.0.0 --port "${NEXT_PORT}" &

echo "[start-prod] Starting Node.js middleware on port ${PORT:-3000}..."
NODE_ENV=production node middleware/index.js