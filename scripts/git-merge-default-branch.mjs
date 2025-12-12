#!/usr/bin/env node

import { execSync } from "node:child_process";

function run(cmd) {
  return execSync(cmd, { encoding: "utf8" }).trim();
}

function safeGitCheck() {
  try {
    return run("git rev-parse --is-inside-work-tree") === "true";
  } catch {
    return false;
  }
}

try {
  // Git repo かチェック
  if (!safeGitCheck()) {
    process.stdout.write("Not a git repository. Skipping.\n");
    process.exit(0);
  }

  // 現在のブランチ名
  const currentBranch = run("git rev-parse --abbrev-ref HEAD");
  process.stdout.write(`Current branch: ${currentBranch}\n`);

  // default branch を取得
  const remoteInfo = run("git remote show origin");
  const match = remoteInfo.match(/HEAD branch:\s+(\S+)/m);

  if (!match) {
    process.stderr.write("Error: Could not detect default branch from origin.\n");
    process.exit(1);
  }

  const defaultBranch = match[1];
  process.stdout.write(`Default branch detected: ${defaultBranch}\n`);

  // fetch
  run("git fetch --prune");

  // default branch を最新にする
  process.stdout.write(`Switching to default branch: ${defaultBranch}\n`);
  run(`git switch ${defaultBranch}`);

  process.stdout.write("Pulling latest changes...\n");
  run("git pull");

  // 元のブランチへ戻る
  process.stdout.write(`Switching back to ${currentBranch}\n`);
  run(`git switch ${currentBranch}`);

  // マージ
  process.stdout.write(`Merging ${defaultBranch} into ${currentBranch}...\n`);

  try {
    run(`git merge ${defaultBranch}`);
    process.stdout.write("Merge completed successfully.\n");
  } catch (err) {
    process.stderr.write("\nMerge conflict detected!\n");
    process.stderr.write("Please resolve the conflict manually.\n");
    process.exit(1);
  }

  process.stdout.write("\nDone!\n");
} catch (err) {
  process.stderr.write("\nError:\n");
  process.stderr.write(`${err?.message ?? err}\n`);
  process.exit(1);
}
