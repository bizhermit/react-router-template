#!/usr/bin/env bash
set -euo pipefail

# 作業ディレクトリがクリーンかチェック
if [ -n "$(git status --porcelain)" ]; then
  echo "Error: Working directory is not clean." >&2
  echo "Please commit or stash your changes before running this script." >&2
  exit 1
fi

# デフォルトブランチ検出（ローカル参照で高速化し、ダメならリモートへ）
default_branch=$(git rev-parse --abbrev-ref origin/HEAD 2>/dev/null | sed 's!origin/!!' || true)

if [ -z "$default_branch" ]; then
  echo "Fetching remote info to detect default branch..."
  default_branch=$(
    git remote show origin 2>/dev/null \
      | sed -n 's/.*HEAD branch: //p'
  )
fi

if [ -z "$default_branch" ]; then
  echo "Error: Could not detect default branch from origin." >&2
  exit 1
fi

echo "Default branch detected: $default_branch"

# デフォルトブランチへ移動 & 最新化
git switch "$default_branch"
git fetch --prune
git merge --ff-only "@{u}"

# 削除対象ブランチ抽出
gone_branches=$(
  git for-each-ref --format '%(refname:short) %(upstream:track)' refs/heads \
  | awk '$2 == "[gone]" {print $1}'
)

if [ -z "$gone_branches" ]; then
  echo
  echo "No branches to delete."
else
  echo
  echo "Deleting branches:"
  echo "$gone_branches" | while IFS= read -r branch; do
    # 空行対策
    if [ -n "$branch" ]; then
      echo "  - $branch"
      if ! git branch -d "$branch"; then
        echo "    Failed (maybe not fully merged)"
      fi
    fi
  done
fi

echo
echo "Done!"
echo
