#!/bin/bash

set -eu

# docker volumeをnodeユーザーに解放 #

PASSWORD="node"
OWNER="node:node"
DIRS=(
  "/workspace/node_modules"
  "/workspace/.react-router"
  "/workspace/.playwright"
)

for dir in "${DIRS[@]}"; do
  echo "$PASSWORD" | sudo -S chown -R "$OWNER" "$dir"
done
