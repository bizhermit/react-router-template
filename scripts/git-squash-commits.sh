#!/usr/bin/env bash
set -euo pipefail

echo "--- Squash commits ---"
echo

# ワーキングツリーがクリーンか（未コミットの変更がないか）チェック
if [ -n "$(git status --porcelain)" ]; then
  echo "❌ Error: Working tree is not clean."
  echo "Please commit or stash your changes first. Aborting."
  exit 1
fi

# 現在のブランチ名を取得して表示
current_branch=$(git rev-parse --abbrev-ref HEAD)
echo "Current branch: $current_branch"

# 1. 分岐元ブランチ名の入力待ち
read -p "Enter the base branch name: " base_branch

# 未入力チェック
if [ -z "$base_branch" ]; then
  echo "❌ Error: Base branch name cannot be empty. Aborting."
  exit 1
fi

# 現在のブランチと同じものを指定していないかチェック
if [ "$current_branch" = "$base_branch" ]; then
  echo "❌ Error: Current branch is the same as the base branch. Aborting."
  exit 1
fi

# 指定されたブランチがGit上に存在するかチェック
if ! git rev-parse --verify --quiet "$base_branch" > /dev/null; then
  echo "❌ Error: Branch '$base_branch' does not exist. Aborting."
  exit 1
fi

# 2. コミットメッセージの入力待ち
read -p "Enter the new commit message: " commit_message

# 未入力チェック
if [ -z "$commit_message" ]; then
  echo "❌ Error: Commit message cannot be empty. Aborting."
  exit 1
fi

# 3. 最終確認
echo "----------------------------------------"
echo "Ready to squash commits with the following details:"
echo " - Target branch  : $current_branch"
echo " - Base branch    : $base_branch"
echo " - Commit message : $commit_message"
echo "----------------------------------------"
read -p "Proceed? (y/n): " confirm

# y または Y 以外が入力されたらキャンセル
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "Operation cancelled."
  exit 0
fi

echo "🚀 Squashing commits..."

# 分岐元ブランチを指定してソフトリセット
git reset --soft "$base_branch"

# まとめた変更をコミット
git commit -m "$commit_message"

echo "✅ Commits squashed successfully!"
