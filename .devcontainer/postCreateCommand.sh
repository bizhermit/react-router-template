#!/bin/bash

set -eu

# docker volumeをnodeユーザー所有に変更
PASSWORD="node"
OWNER="node:node"
DIRS=(
  "/home/node/.ssh"
  "/workspace/node_modules"
  "/workspace/.react-router"
  "/workspace/.playwright"
)

for dir in "${DIRS[@]}"; do
  echo "Changing ownership of $dir to $OWNER"
  echo "$PASSWORD" | sudo -S chown -R "$OWNER" "$dir"
done

# パーミッション設定ルール（ファイルパス:権限）
declare -A SSH_PERMS=(
  ["$HOME/.ssh"]=700
  ["$HOME/.ssh/id_rsa"]=600
  ["$HOME/.ssh/id_ecdsa"]=600
  ["$HOME/.ssh/id_rsa.pub"]=644
  ["$HOME/.ssh/id_ecdsa.pub"]=644
  ["$HOME/.ssh/config"]=600
  ["$HOME/.ssh/known_hosts"]=644
)

for path in "${!SSH_PERMS[@]}"; do
  if [ -e "$path" ]; then
    chmod "${SSH_PERMS[$path]}" "$path"
    echo "set ${SSH_PERMS[$path]}: $path"
  fi
done

# 所有者変更は差分としない
git config --local core.fileMode false

# 依存関係インストール #
npm install

# DB最新化 #
npm run migrate

# 型情報他生成 #
npm run prebuild
