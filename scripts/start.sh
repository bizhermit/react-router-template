#!/bin/sh

set -e

if [ -n "${WAITFOR:-}" ]; then
  echo "[init] Waiting for DB..."
  ./scripts/wait-for-it.sh "$WAITFOR" -t 60
fi

if [ "${MIGRATE:-true}" = "true" ]; then
  echo "[init] Running migrations..."
  node ./.artifacts/scripts/migrate.js

  echo "[init] Inserting seed..."
  node ./.artifacts/scripts/seed.js
fi

echo "[app] Starting app..."
exec npx react-router-serve ./.artifacts/build/server/index.js
