#!/bin/sh

set -e

if [ -n "${WAITFOR:-}" ]; then
  echo "[init] Waiting for DB..."
  ./docker/wait-for-it.sh "$WAITFOR" -t 60
fi

if [ "${MIGRATE:-true}" = "true" ]; then
  echo "[init] Running migrations..."
  node ./docker/migrate.mjs
fi

echo "[app] Starting app..."
exec npx react-router-serve ./.artifacts/build/server/index.js
