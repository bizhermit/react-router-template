#!/usr/bin/env node

import { execSync } from "node:child_process";

function run(cmd) {
  return execSync(cmd, { encoding: "utf8" }).trim();
}

try {
  // git remote show origin の出力を取得
  const output = run("git remote show origin");

  // "HEAD branch: main" → main を抽出
  const match = output.match(/HEAD branch:\s+(\S+)/m);

  if (!match) {
    process.stderr.write("\nError: Could not detect default branch from origin.");
    process.exit(1);
  }

  const defaultBranch = match[1];

  process.stdout.write(`\nDefault branch detected: ${defaultBranch}`);
  // default ブランチへ切り替え
  process.stdout.write("\n");
  run(`git switch ${defaultBranch}`);

  // 最新を取得
  run(`git pull`);
  run("git fetch --prune");

  // git branch -vv の結果を取得
  const branchesOutput = run("git branch -vv");

  // 各行を調べて「: gone]」を含むブランチを抽出
  const lines = branchesOutput.split("\n");

  const goneBranches = lines
    .map(line => line.trim())
    .filter(line => line.includes(": gone]"))
    .map(line => {
      // 先頭の * を除去し、ブランチ名の部分だけ抽出
      return line.replace(/^\*?\s*/, "").split(" ")[0];
    });

  if (goneBranches.length === 0) {
    process.stdout.write("\nNo branches to delete.\n\n");
    process.exit(0);
  }

  // 削除実行
  goneBranches.forEach(branch => {
    process.stdout.write(`\n  - Deleting branch: ${branch}`);
    try {
      run(`git branch -d ${branch}`);
    } catch {
      process.stderr.write(`\nFailed to delete ${branch} (maybe not fully merged).`);
    }
  });

  process.stdout.write("\n\nDone!\n\n");
} catch (err) {
  process.stderr.write("\n\nError:");
  process.stderr.write(`\n${err.message ?? err}\n`);
  process.exit(1);
}
