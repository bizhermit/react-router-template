#!/usr/bin/env bash
set -euo pipefail

# 作業ディレクトリがクリーンかチェック
if [ -n "$(git status --porcelain)" ]; then
  echo "Error: Working directory is not clean." >&2
  echo "Please commit or stash your changes before running this script." >&2
  exit 1
fi

# デフォルトブランチを確実に検出（リモートの変更に自動追従）
echo "Detecting default branch from remote..."
git remote set-head origin -a >/dev/null 2>&1 || true
default_branch=$(git rev-parse --abbrev-ref origin/HEAD 2>/dev/null | sed 's!origin/!!' || true)

is_safe_branch_name() {
  # ブランチ名に危険なメタ文字が含まれないか検証
  local name="$1"
  case "$name" in
    (""|*[!A-Za-z0-9._/-]*) return 1 ;;
    (*) return 0 ;;
  esac
}

if [ -z "$default_branch" ] || [ "$default_branch" = "HEAD" ]; then
  echo "Error: Could not detect default branch from origin." >&2
  exit 1
fi

# ブランチ名にシェルメタ文字が含まれないか検証
if ! is_safe_branch_name "$default_branch"; then
  echo "Error: Suspicious branch name detected: $default_branch" >&2
  exit 1
fi

echo "Default branch detected: $default_branch"

# リモートの最新状態を取得
git fetch --prune

# デフォルトブランチへ移動（無ければ作成）& 最新化
remote_default_branch="origin/$default_branch"
if ! git show-ref --verify --quiet "refs/remotes/$remote_default_branch"; then
  echo "Error: Remote branch $remote_default_branch not found." >&2
  exit 1
fi

if git show-ref --verify --quiet "refs/heads/$default_branch"; then
  git switch "$default_branch"
else
  echo "Creating local tracking branch $default_branch from $remote_default_branch..."
  git switch --track -c "$default_branch" "$remote_default_branch"
fi

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
      if ! is_safe_branch_name "$branch"; then
        echo "    Skipped (unsafe branch name detected)" >&2
        continue
      fi
      if ! git branch -d "$branch"; then
        echo "    Failed (maybe not fully merged)"
      fi
    fi
  done
fi

echo
echo "Done!"
echo
