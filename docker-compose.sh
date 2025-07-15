#!/bin/bash

./scripts/generate-env.sh ./.container/.env production

# docker-compose 実行
docker compose -f ./.container/docker-compose.yml "$@"
