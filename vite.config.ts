import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const devPort = (() => {
    const s = env.DEV_PORT || process.env.DEV_PORT;
    if (s?.match(/^\d*$/)) return Number(s);
    return undefined;
  })();

  return {
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
