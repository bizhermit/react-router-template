import { path_health } from "./internal-api-paths/health";
import { paths_sandbox } from "./internal-api-paths/sandbox";

export default {
  openapi: "3.1.0",
  info: {
    title: "internal API",
    description: "internal API",
    version: "0.0.0",
  },
  servers: {
    url: "http://localhost:3000",
  },
  security: [
    {
      type: "ApiKey",
      global: true,
    },
  ],
  paths: [
    path_health,
    ...paths_sandbox,
  ],
} satisfies ApiDoc.Root;
