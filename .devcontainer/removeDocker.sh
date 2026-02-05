#!/bin/bash

# .env ファイルを読み込む
if [ -f "docker/.env" ]; then
  echo "Loading env file..."
  source docker/.env
fi

if [ -z "$COMPOSE_PROJECT_NAME" ]; then
  COMPOSE_PROJECT_NAME="template-dev"
fi

echo "Deleting development containers and volumes..."
echo " - Container prefix: $COMPOSE_PROJECT_NAME"

# -p オプションでプロジェクト名を明示的に指定する
echo "Stopping and removing containers, networks, and volumes defined in the compose file..."
docker-compose -p "$COMPOSE_PROJECT_NAME" -f docker/compose.base.yml -f docker/compose.dev.yml down -v

echo "Cleanup completed."

# dockerの不要データをクリーンアップ
echo "docker prune start."

# docker container prune -f # コンテナは削除しない
# docker network prune -f # 外部ネットワークは削除しない
docker volume prune -f
docker image prune -a -f
docker builder prune -a -f
# docker system prune -a --volumes -f

echo "docker prune completed."
