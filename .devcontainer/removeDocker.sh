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

# dockerの不要データをクリーンアップ
echo "docker prune start."

# docker container prune -f # コンテナは削除しない
docker network prune -f
docker volume prune -f
docker image prune -a -f
docker builder prune -a -f
# docker system prune -a --volumes -f

echo "docker prune completed."
