import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
  ],
  test: {
    environment: "jsdom",
    include: [
      "src/**/*.component.test.ts",
      "src/**/*.component.test.tsx",
    ],
    exclude: [
      "node_modules/**",
      ".artifacts/**",
      ".react-router/**",
    ],
  },
});
