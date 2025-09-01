#!/bin/bash

# docker-compose 実行
docker compose -f ./.container/docker-compose.yml "$@"
