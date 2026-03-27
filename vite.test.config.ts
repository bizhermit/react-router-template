import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

const unitExcludes = [
  "src/**/*.comp.test.ts",
  "src/**/*.comp.test.tsx",
  "src/**/*.component.test.ts",
  "src/**/*.component.test.tsx",
  "src/**/*.int.test.ts",
  "src/**/*.int.test.tsx",
  "src/**/*.integration.test.ts",
  "src/**/*.integration.test.tsx",
];

export default defineConfig(({ mode }) => {
  const target = (mode || "all").toLowerCase();

  const common = {
    plugins: [
      tsconfigPaths(),
    ],
    test: {
      environment: "node",
      include: [
        "src/**/*.{test,spec}.ts",
        "src/**/*.{test,spec}.tsx",
      ],
      exclude: [
        "node_modules/**",
        ".artifacts/**",
        ".react-router/**",
      ],
      // component テストのみ jsdom で実行し、それ以外は node を使用する
      environmentMatchGlobs: [
        ["src/**/*.comp.test.ts", "jsdom"],
        ["src/**/*.comp.test.tsx", "jsdom"],
        ["src/**/*.component.test.ts", "jsdom"],
        ["src/**/*.component.test.tsx", "jsdom"],
      ],
    },
  };

  if (target === "unit") {
    return {
      ...common,
      test: {
        ...common.test,
        exclude: [
          ...common.test.exclude,
          ...unitExcludes,
        ],
      },
    };
  }

  if (target === "integration") {
    return {
      ...common,
      test: {
        ...common.test,
        include: [
          "src/**/*.int.test.ts",
          "src/**/*.int.test.tsx",
          "src/**/*.integration.test.ts",
          "src/**/*.integration.test.tsx",
        ],
      },
    };
  }

  if (target === "component") {
    return {
      ...common,
      test: {
        ...common.test,
        environment: "jsdom",
        include: [
          "src/**/*.comp.test.ts",
          "src/**/*.comp.test.tsx",
          "src/**/*.component.test.ts",
          "src/**/*.component.test.tsx",
        ],
      },
    };
  }

  // 引数なし（デフォルト）は全テストを実行する
  return common;
});
