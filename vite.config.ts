import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const envDir = "docker";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.join(process.cwd(), envDir), "");

  const devPort = (() => {
    const s = env.DEV_PORT || process.env.DEV_PORT;
    if (s?.match(/^\d*$/)) return Number(s);
    return undefined;
  })();

  return {
    envDir,
    plugins: [
      tailwindcss(),
      reactRouter(),
      tsconfigPaths(),
    ],
    server: {
      port: devPort,
      watch: env.POLLING === "true" ? {
        usePolling: true,
        interval: 300,
        ignored: [
          ".devcontainer/**",
          ".playwright/**",
          "**/node_modules/**",
          "**/.git/**",
          "**/build/**",
          "scripts/**",
        ],
      } : undefined,
    },
    preview: {
      port: devPort,
    },
    build: {
      rollupOptions: {
        external: [/\.stories\./],
      },
    },
  };
});
