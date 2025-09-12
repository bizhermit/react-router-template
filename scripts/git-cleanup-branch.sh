#!/bin/bash

set -euo pipefail

log() { printf '[%s] %s\n' "$(date +%H:%M:%S)" "$*"; }

log "Start cleanup"

log "Detecting default branch (fallback: main)"
# Determine target default branch
if git remote get-url origin >/dev/null 2>&1; then
  remote_head=$(git symbolic-ref --quiet --short refs/remotes/origin/HEAD 2>/dev/null | sed 's|^origin/||')
  target_branch=${remote_head:-main}
  log "Origin found. Remote HEAD -> ${remote_head:-'(none)'} / target -> $target_branch"
else
  target_branch=main
  log "No origin remote. Use local default -> $target_branch"
fi

log "Switching to $target_branch"
# Switch (create/track as needed)
if git show-ref --verify --quiet "refs/heads/$target_branch"; then
  log "Local branch exists"
  git switch "$target_branch"
else
  if git show-ref --verify --quiet "refs/remotes/origin/$target_branch"; then
    log "Creating local tracking branch from origin/$target_branch"
    git switch --track "origin/$target_branch"
  else
    log "Creating new local branch $target_branch"
    git switch -c "$target_branch"
  fi
fi

log "Pull latest (ignore errors if newly created)"
if ! git pull; then
  log "Pull failed (probably new branch, or conflict)"
fi

log "Fetch & prune"
git fetch --prune

log "Scanning stale local branches (whose upstream is gone)"
stale_branches=$(git for-each-ref --format '%(refname:short) %(upstream:track)' refs/heads | awk '$2=="[gone]" {print $1}')
if [ -n "$stale_branches" ]; then
  count=$(printf '%s\n' "$stale_branches" | wc -l | tr -d ' ')
  log "Deleting $count stale branch(es):"
  printf '%s\n' "$stale_branches"
  printf '%s\n' "$stale_branches" | xargs -r git branch -d
else
  log "No stale branches found"
fi

log "Done"
