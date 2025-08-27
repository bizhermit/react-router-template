#!/bin/bash

# .env ファイルを読み込む
if [ -f ".devcontainer/.env" ]; then
  source .devcontainer/.env
fi

# PROJECT_NAMEが設定されていなければディレクトリ名から設定する
if [ -z "$PROJECT_NAME" ]; then
  CURRENT_DIR_NAME=$(basename "$PWD")
  PROJECT_NAME="${CURRENT_DIR_NAME}_devcontainer"
fi

COMPOSE_FILE=".devcontainer/docker-compose.yml"

echo "Deleting development containers and volumes..."
echo " - Project name: $PROJECT_NAME"
echo " - Docker Compose file: $COMPOSE_FILE"

# -p オプションでプロジェクト名を明示的に指定する
echo "Stopping and removing containers, networks, and volumes defined in the compose file..."
docker-compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" down -v

echo "Cleanup completed."
