import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
  ],
  test: {
    environment: "node",
    include: [
      "src/**/*.integration.test.ts",
      "src/**/*.integration.test.tsx",
    ],
    exclude: [
      "node_modules/**",
      ".artifacts/**",
      ".react-router/**",
    ],
  },
});
