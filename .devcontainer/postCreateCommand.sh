#!/usr/bin/env bash

set -eu

log() {
	printf '[postCreate][%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

log "postCreateCommand を開始します"

# npm 設定ファイル準備
if [ -f .npmrc ]; then
	log ".npmrc は既に存在するため、そのまま利用します"
elif [ -f .npmrc.example ]; then
	log ".npmrc が存在しないため、.npmrc.example から作成します"
	cp .npmrc.example .npmrc
else
	log "警告: .npmrc.example が見つからないため、.npmrc を作成できません"
fi

# 依存関係インストール #
log "依存関係をインストールします"
npm ci

log "PostgreSQL の起動を待機します: ${DATABASE_HOST}:${POSTGRES_PORT}"
bash ./scripts/wait-for-it.sh "$DATABASE_HOST:$POSTGRES_PORT" -t 60

# DB最新化
log "DB マイグレーションを実行します"
npm run dev:migrate

# DB初回データ作成
log "初回データを投入します"
npm run postgres:init

log "postCreateCommand が完了しました"
