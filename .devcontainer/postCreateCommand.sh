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
if [ -d "$HOME/.ssh" ]; then
  chmod 700 ~/.ssh
fi

# 秘密鍵
if [ -f "$HOME/.ssh/id_rsa" ]; then
  chmod 600 ~/.ssh/id_rsa
fi
if [ -f "$HOME/.ssh/id_ecdsa" ]; then
  chmod 600 ~/.ssh/id_ecdsa
fi

# 公開鍵
if [ -f "$HOME/.ssh/id_rsa.pub" ]; then
  chmod 644 ~/.ssh/id_rsa.pub
fi
if [ -f "$HOME/.ssh/id_ecdsa.pub" ]; then
  chmod 644 ~/.ssh/id_ecdsa.pub
fi

# configファイル
if [ -f "$HOME/.ssh/config" ]; then
  chmod 600 ~/.ssh/config
fi

# known_hostsは読み取りのみ
if [ -f "$HOME/.ssh/known_hosts" ]; then
  chmod 644 ~/.ssh/known_hosts
fi

# 所有者変更は差分としない
git config --local core.fileMode false
