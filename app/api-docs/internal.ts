import { path_health } from "./internal/paths/health";
import { paths_sandbox } from "./internal/paths/sandbox";

export default {
  openapi: "3.1.0",
  info: {
    title: "internal API",
    version: "0.0.0",
  },
  servers: {
    url: "http://localhost:3000",
  },
  security: {
    headers: {
      "Api-Key": {
        type: "string",
        required: true,
        example: "abc123",
      },
    },
  },
  paths: [
    path_health,
    ...paths_sandbox,
  ],
} satisfies ApiDoc.Root;
