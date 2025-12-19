import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const localesDirPath = path.join(process.cwd(), "public", "locales");
const outputFilePath = path.join(process.cwd(), "app", "i18n", "types+.d.ts");

if (!existsSync(localesDirPath)) {
  process.stderr.write(`Error: The locales directory does not exist at ${localesDirPath}\n`);
  process.exit(0);
}

const files = readdirSync(localesDirPath);

if (files.length === 0) {
  process.stderr.write(`Error: No JSON files found in the locales directory at ${localesDirPath}\n`);
  process.exit(0);
}

const map = {};

files.forEach(file => {
  if (!file.endsWith(".json")) {
    return;
  }
  const ctx = file.split(".");
  let namespace = null;
  if (ctx.length === 3) {
    namespace = ctx[1];
  }

  const fullPath = path.join(localesDirPath, file);
  try {
    const content = readFileSync(fullPath, "utf-8");
    const json = JSON.parse(content);
    if (typeof json !== "object" || json === null) {
      process.stderr.write(`Error: The file ${file} does not contain a valid JSON object.\n`);
      return;
    }
    const prefix = namespace ? `${namespace}.` : "";
    for (const key in json) {
      const fullKey = `${prefix}${key}`;
      const text = String(json[key]);
      if (!map[fullKey]) {
        map[fullKey] = [];
      }
      const replaceKeys = [...text.matchAll(/\{\{(.*?)\}\}/g)].map(match => match[1]);
      map[fullKey].push(...replaceKeys);
    }
  } catch (error) {
    process.stderr.write(`Error: Failed to read or parse the file ${file}. Error: ${error}\n`);
    return;
  }
});

let output = `/* eslint-disable @stylistic/quote-props */\n// This file is auto-generated. Do not edit manually.\n\n`;
output += `interface I18N_Texts {\n`;
for (const key in map) {
  const replaceKeys = Array.from(new Set(map[key]));
  output += `  "${key}": ${(() => {
    if (replaceKeys.length === 0) return "null";
    return replaceKeys.map(s => `"${s}"`).join(" | ");
  })()};\n`;
}

output += `};\n`;

writeFileSync(outputFilePath, output, "utf-8");
process.stdout.write(`I18n keys have been generated and written to ${outputFilePath}\n\n`);
process.exit(0);
