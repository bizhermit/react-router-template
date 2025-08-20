import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";
import { SIGN_IN_PATHNAME, SIGN_OUT_PATHNAME } from "./features/auth/consts";

export default [
  index("routes/page.tsx"),
  // ...prefix("/:lang", [
  //   index("routes/language.tsx"),
  //   route("home", "routes/home/page.tsx"),
  // ]),
  route(SIGN_IN_PATHNAME, "routes/sign-in.tsx"),
  route(SIGN_OUT_PATHNAME, "routes/sign-out.tsx"),
  layout("routes/user/layout.tsx", [
    route("home", "routes/user/home.tsx"),
    route("settings", "routes/user/settings.tsx"),
  ]),
  ...prefix("api", [
  ]),
  route("csp-report", "routes/csp-report.tsx"),
  route("health", "routes/health.ts"),
  route("auth/*", "routes/auth.ts"),
  ...prefix("sandbox", [
    index("routes/sandbox/page.tsx"),
    route("/api", "routes/sandbox/api.ts"),
    route("/api/:id", "routes/sandbox/api-detail.ts"),
    route("/stream", "routes/sandbox/stream-api.ts"),
  ]),
  route("*", "routes/fallback.tsx"),
] satisfies RouteConfig;
