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
    process.stderr.write("Error: Could not detect default branch from origin.\n");
    process.exit(1);
  }

  const defaultBranch = match[1];

  process.stdout.write(`Default branch detected: ${defaultBranch}\n`);
  // default ブランチへ切り替え
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
    process.stdout.write("\nNo branches to delete.\n");
    process.exit(0);
  }

  // 削除実行
  goneBranches.forEach(branch => {
    process.stdout.write(`  - Deleting branch: ${branch}\n`);
    try {
      run(`git branch -d ${branch}`);
    } catch {
      process.stderr.write(`Failed to delete ${branch} (maybe not fully merged).\n`);
    }
  });

  process.stdout.write("\nDone!\n");
} catch (err) {
  process.stderr.write("\nError:\n");
  process.stderr.write(`${err.message ?? err}\n`);
  process.exit(1);
}
