#!/bin/bash

# docker-compose 実行
docker compose \
  --env-file docker/.env \
  -f docker/compose.base.yml \
  -f docker/compose.prod.yml \
  "$@"
