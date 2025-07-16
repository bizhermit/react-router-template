import { type RouteConfig, index, prefix, route } from "@react-router/dev/routes";

export default [
  index("routes/page.tsx"),
  // ...prefix("/:lang", [
  //   index("routes/language.tsx"),
  //   route("home", "routes/home/page.tsx"),
  //   route("web-form", "routes/web-form/page.tsx"),
  // ]),
  route("csp-report", "routes/csp-report.tsx"),
  ...prefix("sandbox", [
    index("routes/sandbox/page.tsx"),
    route("stream", "routes/sandbox/stream-api.ts"),
  ]),
  route("*", "routes/fallback.tsx"),
] satisfies RouteConfig;
