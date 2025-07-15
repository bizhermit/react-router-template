#!/bin/bash

set -e

CONTAINER_ENV_FILE="${1}"
NODE_ENV="${2}"

echo "generate .env for docker-compose.yml -> $CONTAINER_ENV_FILE"

append_env_file() {
  local file=$1
  if [ -f "$file" ]; then
    echo "- $file"
    if grep -qEv '^[[:space:]]*(#|$)' "$file"; then
      echo "  - add"
      cleaned=$(grep -v '^[[:space:]]*#' "$file")
      contents="${contents}\n# ${file} #\n${cleaned}\n"
    else
      echo "  - skip (empty or comments only)"
    fi
  fi
}

if [ -z "$CONTAINER_ENV_FILE" ]; then
  echo "not set export file path"
  exit 1
fi

contents="# This file is auto-generated. Do not edit manually.\n"

append_env_file ".env"
if [ -n "$NODE_ENV" ]; then
  append_env_file ".env.$NODE_ENV"
fi
append_env_file ".env.local"
if [ -n "$NODE_ENV" ]; then
  append_env_file ".env.$NODE_ENV.local"
fi

echo -e "$contents" > "$CONTAINER_ENV_FILE"

echo "generated. NODE_ENV=$NODE_ENV"
