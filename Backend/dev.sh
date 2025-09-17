#!/usr/bin/env bash
set -e

# Kill anything on :8001
if lsof -i :8001 >/dev/null 2>&1; then
  PID=$(lsof -ti :8001 | head -n1)
  echo "Killing PID $PID on :8001"
  kill -9 "$PID" || true
fi

python3 --version
python3 manage.py check
python3 manage.py migrate

# Bind to all interfaces (handles Docker/WSL cases)
echo "Starting Django at 0.0.0.0:8001..."
python3 manage.py runserver 0.0.0.0:8001
