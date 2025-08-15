import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";

export default [
  index("routes/page.tsx"),
  // ...prefix("/:lang", [
  //   index("routes/language.tsx"),
  //   route("home", "routes/home/page.tsx"),
  // ]),
  route("sign-in", "routes/sign-in.tsx"),
  layout("routes/user/layout.tsx", [
    route("home", "routes/user/home.tsx"),
    route("settings", "routes/user/settings.tsx"),
  ]),
  route("csp-report", "routes/csp-report.tsx"),
  route("health", "routes/health.ts"),
  ...prefix("api", [
    route("auth/:nextauth", "routes/auth.ts"),
  ]),
  ...prefix("sandbox", [
    index("routes/sandbox/page.tsx"),
    route("/api", "routes/sandbox/api.ts"),
    route("/api/:id", "routes/sandbox/api-detail.ts"),
    route("/stream", "routes/sandbox/stream-api.ts"),
  ]),
  route("*", "routes/fallback.tsx"),
] satisfies RouteConfig;
