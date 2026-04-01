#!/usr/bin/env bash

set -eu

log() {
	printf '[postCreate][%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

log "postCreateCommand を開始します"

# 依存関係インストール #
log "依存関係をインストールします"
npm ci --no-audit --no-fund

log "PostgreSQL の起動を待機します: ${DATABASE_HOST}:${POSTGRES_PORT}"
bash ./scripts/wait-for-it.sh "$DATABASE_HOST:$POSTGRES_PORT" -t 60

# DB最新化
log "DB マイグレーションを実行します"
npm run dev:migrate

# DB初回データ作成
log "初回データを投入します"
npm run postgres:init

log "postCreateCommand が完了しました"
