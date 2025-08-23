import { existsSync, mkdirSync, readdirSync, rmSync, statSync } from "fs";
import { createRequire } from "module";
import path from "path";
import { pathToFileURL } from "url";

const require = createRequire(import.meta.url);
const ts = require("typescript");

// ===== 設定 =====
const projectRoot = process.cwd();
const tsconfigPath = path.join(projectRoot, "tsconfig.json");
const tempDirPath = path.join(projectRoot, ".temp");
const targetDirPath = path.join(projectRoot, "app/api-docs");

if (!existsSync(targetDirPath)) {
  process.stdout.write(`Warning: not found target directory: ${targetDirPath}`);
  process.exit(0);
}

const entryFiles = readdirSync(targetDirPath)
  .map(name => {
    const fullName = path.join(targetDirPath, name);
    if (statSync(fullName).isDirectory()) return null;
    if (name.endsWith(".d.ts")) return null;
    if (name.endsWith(".ts")) return fullName;
    return null;
  })
  .filter(Boolean);

if (entryFiles.length === 0) {
  process.stdout.write(`Warning: not found target files: ${targetDirPath}`);
  process.exit(0);
}

// ===== tsconfig 読み込み =====
function loadTsConfig(configPath) {
  if (!existsSync(configPath)) {
    return {
      options: {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.NodeNext,
        outDir: tempDirPath,
        rootDir: projectRoot,
        declaration: false,
        emitDeclarationOnly: false,
        noEmit: false,
        allowJs: false,
        esModuleInterop: true,
        skipLibCheck: true,
      },
    };
  }
  const configResult = ts.readConfigFile(configPath, ts.sys.readFile);
  if (configResult.error) {
    const msg = ts.flattenDiagnosticMessageText(configResult.error.messageText, "\n");
    throw new Error(`Failed to read tsconfig.json: ${msg}`);
  }
  const parsed = ts.parseJsonConfigFileContent(
    configResult.config,
    ts.sys,
    path.dirname(configPath)
  );
  // 出力先などを強制
  parsed.options.outDir = tempDirPath;
  parsed.options.declaration = false;
  parsed.options.emitDeclarationOnly = false;
  parsed.options.noEmit = false;
  parsed.options.rootDir ??= projectRoot;
  // ESM の import を維持するため ESNext を推奨
  parsed.options.module ??= ts.ModuleKind.ESNext;
  return parsed;
}

const parsedConfig = loadTsConfig(tsconfigPath);
const compilerOptions = parsedConfig.options;

// .temp を用意（クリーン）
try {
  rmSync(tempDirPath, { recursive: true, force: true });
} catch {
  // ignore
}
mkdirSync(tempDirPath, { recursive: true });

// ===== エイリアスを相対パスへ書き換えるトランスフォーマ =====
function createAliasToRelativeTransformer(program, options) {
  const host = ts.sys;
  const projectRootNorm = normalizeSlashes(projectRoot);

  function resolveModule(spec, containingFile) {
    // TypeScript の解決を利用（paths/baseUrl/拡張子補完対応）
    const res = ts.resolveModuleName(spec, containingFile, options, host);
    return res?.resolvedModule?.resolvedFileName || null;
  }

  function shouldRewrite(spec) {
    // 既に相対参照なら書き換え不要
    if (spec.startsWith(".") || spec.startsWith("/")) return false;
    // パッケージ名（@scope/pkg など）は基本書き換えない
    if (!spec.includes("/")) return true; // 例えば "utils" などは true にしても解決次第
    return true;
  }

  // function toOutRelative(fromFile, resolvedFile, originalText) {
  //   // 出力は .temp にミラーされるため、相対関係はソースと同じ
  //   let target = resolvedFile;

  //   // index.ts/tsx をインデックス無しへ短縮（元が /index 指定でない場合）
  //   const endsWithIndexTs =
  //     /[\\/]index\.(ts|tsx|js|jsx)$/.test(target);
  //   if (endsWithIndexTs && !/\/index(\.(t|j)sx?)?$/.test(originalText)) {
  //     target = path.dirname(target);
  //   }

  //   // 相対パス算出
  //   let rel = path.relative(path.dirname(fromFile), target);
  //   rel = normalizeSlashes(rel);

  //   // 先頭に ./ を付与
  //   if (!rel.startsWith(".")) rel = "./" + rel;

  //   // 拡張子調整:
  //   // - 元の指定に拡張子があれば .js に揃える
  //   // - なければ拡張子は付けず（ツールチェインに任せる）
  //   const hasExtInOriginal = /\.[a-zA-Z0-9]+$/.test(originalText);
  //   if (hasExtInOriginal) {
  //     rel = rel.replace(/\.(ts|tsx|jsx|js)$/, "") + ".js";
  //     // index を短縮した場合、".js" が残ったままにならないよう調整
  //     rel = rel.replace(/\/index\.js$/, "");
  //   } else {
  //     // 元が拡張子なしの場合は .ts/.tsx/.js/.jsx を除去
  //     rel = rel.replace(/\.(ts|tsx|jsx|js)$/, "");
  //     rel = rel.replace(/\/index$/, ""); // index 省略
  //   }

  //   return rel;
  // }
  function toOutRelative(fromFile, resolvedFile /* , originalText */) {
    // 出力は .temp にミラーされるため、相対関係はソースと同じ
    const target = resolvedFile;

    // 相対パス算出（index の省略はせず、必ずファイルを指す）
    let rel = path.relative(path.dirname(fromFile), target);
    rel = normalizeSlashes(rel);

    // 先頭に ./ を付与
    if (!rel.startsWith(".")) rel = "./" + rel;

    // 常に .js へ置換（.ts/.tsx/.jsx/.js いずれも .js に統一）
    rel = rel.replace(/\.(ts|tsx|jsx|js)$/, ".js");

    return rel;
  }

  function normalizeSlashes(p) {
    return p.replace(/\\/g, "/");
  }

  function isProjectFile(filePath) {
    const norm = normalizeSlashes(filePath);
    return norm.startsWith(projectRootNorm + "/") && !norm.includes("/node_modules/");
  }

  // function visitModuleSpecifier(sf, node, getLiteral) {
  //   const lit = getLiteral(node);
  //   if (!lit || !ts.isStringLiteralLike(lit)) return node;

  //   const spec = lit.text;
  //   if (!shouldRewrite(spec)) return node;

  //   const resolved = resolveModule(spec, sf.fileName);
  //   if (!resolved || !isProjectFile(resolved)) return node;

  //   const nextText = toOutRelative(sf.fileName, resolved, spec);
  //   if (nextText === spec) return node;

  //   const newLiteral = ts.factory.createStringLiteral(nextText);

  //   if (ts.isImportDeclaration(node)) {
  //     return ts.factory.updateImportDeclaration(
  //       node,
  //       node.modifiers,
  //       node.importClause,
  //       newLiteral,
  //       // TS 5+ は attributes にリネーム。互換のため両対応。
  //       node.assertClause ?? node.attributes
  //     );
  //   }

  //   if (ts.isExportDeclaration(node)) {
  //     return ts.factory.updateExportDeclaration(
  //       node,
  //       node.modifiers,
  //       node.isTypeOnly ?? false,
  //       node.exportClause,
  //       newLiteral,
  //       node.assertClause ?? node.attributes
  //     );
  //   }

  //   if (
  //     ts.isCallExpression(node) &&
  //     node.expression.kind === ts.SyntaxKind.ImportKeyword &&
  //     node.arguments.length === 1 &&
  //     ts.isStringLiteralLike(node.arguments[0])
  //   ) {
  //     const args = ts.factory.createNodeArray([newLiteral]);
  //     return ts.factory.updateCallExpression(
  //       node,
  //       node.expression,
  //       node.typeArguments,
  //       args
  //     );
  //   }

  //   return node;
  // }
  function visitModuleSpecifier(sf, node, getLiteral) {
    const lit = getLiteral(node);
    if (!lit || !ts.isStringLiteralLike(lit)) return node;

    const spec = lit.text;

    // すべての spec を解決して、プロジェクト内ファイルに解決できたときのみ書き換える
    const resolved = resolveModule(spec, sf.fileName);
    if (!resolved || !isProjectFile(resolved)) return node;

    const nextText = toOutRelative(sf.fileName, resolved /* , spec */);
    if (nextText === spec) return node;

    const newLiteral = ts.factory.createStringLiteral(nextText);

    if (ts.isImportDeclaration(node)) {
      return ts.factory.updateImportDeclaration(
        node,
        node.modifiers,
        node.importClause,
        newLiteral,
        // TS 5+ は attributes にリネーム。互換のため両対応。
        node.assertClause ?? node.attributes
      );
    }

    if (ts.isExportDeclaration(node)) {
      return ts.factory.updateExportDeclaration(
        node,
        node.modifiers,
        node.isTypeOnly ?? false,
        node.exportClause,
        newLiteral,
        node.assertClause ?? node.attributes
      );
    }

    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length === 1 &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      const args = ts.factory.createNodeArray([newLiteral]);
      return ts.factory.updateCallExpression(
        node,
        node.expression,
        node.typeArguments,
        args
      );
    }

    return node;
  }

  return (context) => {
    const visit = (sf) => {
      const visitor = (node) => {
        if (ts.isImportDeclaration(node) && node.moduleSpecifier) {
          return visitModuleSpecifier(sf, node, n => n.moduleSpecifier);
        }
        if (ts.isExportDeclaration(node) && node.moduleSpecifier) {
          return visitModuleSpecifier(sf, node, n => n.moduleSpecifier);
        }
        // 動的 import("...")
        if (
          ts.isCallExpression(node) &&
          node.expression.kind === ts.SyntaxKind.ImportKeyword &&
          node.arguments.length === 1 &&
          ts.isStringLiteralLike(node.arguments[0])
        ) {
          return visitModuleSpecifier(sf, node, n => n.arguments[0]);
        }
        return ts.visitEachChild(node, visitor, context);
      };
      return ts.visitNode(sf, visitor);
    };
    return visit;
  };
}

// ===== コンパイル =====
function compile(entries, options) {
  // tsconfig で解決されたファイル一覧から .d.ts を追加して型だけ読み込む
  const allDts = (parsedConfig.fileNames ?? []).filter(
    f => f.endsWith(".d.ts") && !f.includes("node_modules")
  );
  const rootNames = Array.from(new Set([...entries, ...allDts]));

  // rootNames に entry + d.ts を渡す
  const program = ts.createProgram({
    rootNames,
    options,
  });

  const transformer = createAliasToRelativeTransformer(program, options);

  // 診断表示（任意）
  const preDiagnostics = ts.getPreEmitDiagnostics(program);
  if (preDiagnostics.length > 0) {
    const formatted = ts.formatDiagnosticsWithColorAndContext(preDiagnostics, {
      getCurrentDirectory: () => projectRoot,
      getNewLine: () => "\n",
      getCanonicalFileName: f => f,
    });
    process.stdout.write(formatted + "\n");
  }

  const emitResult = program.emit(
    undefined,
    undefined,
    undefined,
    false,
    { before: [transformer] }
  );

  const postDiagnostics = emitResult.diagnostics;
  if (postDiagnostics.length > 0) {
    const formatted = ts.formatDiagnosticsWithColorAndContext(postDiagnostics, {
      getCurrentDirectory: () => projectRoot,
      getNewLine: () => "\n",
      getCanonicalFileName: f => f,
    });
    process.stdout.write(formatted + "\n");
  }

  if (emitResult.emitSkipped) {
    process.stderr.write("Emit skipped due to errors.\n");
    process.exitCode = 1;
  } else {
    process.stdout.write(`Transpile finished. Output: ${tempDirPath}\n`);
  }
}

compile(entryFiles, compilerOptions);

const transpiledTargetDirPath = path.join(tempDirPath, "app", "api-docs");
const docFiles = readdirSync(transpiledTargetDirPath)
  .filter(name => {
    return !statSync(path.join(transpiledTargetDirPath, name)).isDirectory();
  });
console.log(docFiles);

await Promise.all(docFiles.map(async (name) => {
  const fullName = path.join(transpiledTargetDirPath, name);
  const mod = await import(pathToFileURL(fullName).href);
  console.log(mod.default);
}));
