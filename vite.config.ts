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
    },
    preview: {
      port: devPort,
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
        },
      },
    },
  };
});
