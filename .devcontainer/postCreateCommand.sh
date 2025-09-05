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

# ~/.ssh ディレクトリ
chmod 700 ~/.ssh

# 秘密鍵
chmod 600 ~/.ssh/id_rsa
chmod 600 ~/.ssh/id_ecdsa

# 公開鍵
chmod 644 ~/.ssh/id_rsa.pub
chmod 644 ~/.ssh/id_ecdsa.pub

# configファイル
chmod 600 ~/.ssh/config

# known_hostsは読み取りのみ
chmod 644 ~/.ssh/known_hosts

# 所有者変更は差分としない
git config --local core.fileMode false
