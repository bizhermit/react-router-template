#!/bin/bash

# docker-compose 実行
docker compose \
  -f ./docker/compose.base.yml \
  -f ./docker/compose.prod.yml \
  "$@"
