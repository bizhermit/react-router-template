#!/bin/sh

set -e

if [ -n "${WAITFOR:-}" ]; then
  echo "[init] Waiting for DB..."
  ./wait-for-it.sh "$WAITFOR" -t 60
fi

if [ "${MIGRATE:-true}" = "true" ]; then
  echo "[init] Running migrations..."
  npm run migrate
fi

echo "[app] Starting app..."
exec npm run start
