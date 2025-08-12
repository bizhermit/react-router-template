#!/bin/bash
set -euo pipefail

# Merge (default) branch into current branch.
# Usage: merge-default-branch.sh [--rebase|-r]
#   --rebase / -r : use git rebase instead of merge
# Detection: origin/HEAD -> default, fallback to main if not resolvable or no remote

log() { printf '[%s] %s\n' "$(date +%H:%M:%S)" "$*"; }
err() { printf '[%s] ERROR: %s\n' "$(date +%H:%M:%S)" "$*" >&2; }

mode=merge
if [[ ${1:-} == '--rebase' || ${1:-} == '-r' ]]; then
  mode=rebase
fi

# Ensure we are inside a git repository
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  err "Not a git repository"
  exit 1
fi

current_branch=$(git rev-parse --abbrev-ref HEAD)
log "Current branch: $current_branch"

# Determine default branch name
if git remote get-url origin >/dev/null 2>&1; then
  remote_head=$(git symbolic-ref --quiet --short refs/remotes/origin/HEAD 2>/dev/null | sed 's|^origin/||') || true
  default_branch=${remote_head:-main}
  log "Origin detected. Remote HEAD -> ${remote_head:-'(none)'} / using default -> $default_branch"
else
  default_branch=main
  log "No origin remote. Fallback default branch -> $default_branch"
fi

if [[ "$current_branch" == "$default_branch" ]]; then
  log "Current branch is the default branch ($default_branch). Nothing to do."
  exit 0
fi

# Fetch updates if remote exists
if git remote get-url origin >/dev/null 2>&1; then
  log "Fetching from origin"
  git fetch origin --prune
fi

# Determine reference to merge/rebase from
if git show-ref --verify --quiet "refs/remotes/origin/$default_branch"; then
  from_ref="origin/$default_branch"
elif git show-ref --verify --quiet "refs/heads/$default_branch"; then
  from_ref="$default_branch"
else
  err "Default branch reference '$default_branch' not found locally or in origin"
  exit 1
fi

log "Integrating from: $from_ref (mode: $mode)"

# Check if already up to date
if git merge-base --is-ancestor "$from_ref" HEAD; then
  log "Already up to date (HEAD contains $from_ref)"
  exit 0
fi

if [[ $mode == rebase ]]; then
  log "Rebasing $current_branch onto $from_ref"
  if git rebase "$from_ref"; then
    log "Rebase completed"
  else
    err "Rebase stopped due to conflicts. Resolve and run: git rebase --continue (or --abort)"
    exit 1
  fi
else
  log "Merging $from_ref into $current_branch"
  set +e
  git merge --no-ff --no-edit "$from_ref"
  rc=$?
  set -e
  if [[ $rc -ne 0 ]]; then
    err "Merge has conflicts. Resolve them, then commit or abort with: git merge --abort"
    exit $rc
  fi
  log "Merge completed"
fi

log "Done"
