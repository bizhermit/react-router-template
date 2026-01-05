import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";
import { SIGN_IN_PATHNAME, SIGN_OUT_PATHNAME } from "../features/auth/shared/consts";

export default [
  index("routes/index.tsx"),
  // sign-in/out
  route(SIGN_IN_PATHNAME, "routes/sign-in.tsx"),
  route(SIGN_OUT_PATHNAME, "routes/sign-out.tsx"),
  // signed-in
  layout("layouts/signed-in.tsx", [
    route("/home", "routes/home.tsx"),
    route("/settings", "routes/settings.tsx"),
  ]),
  // sandbox
  ...prefix("/sandbox", [
    index("routes/sandbox/index.tsx"),
    route("/hoge", "routes/sandbox/hoge.tsx"),
    route("/api", "routes/sandbox/api.ts"),
    route("/api/:id", "routes/sandbox/api-detail.ts"),
    route("/stream", "routes/sandbox/stream-api.ts"),
  ]),
  // system
  route("/health", "routes/health.ts"),
  route("/csp-report", "routes/csp-report.tsx"),
  route("*", "routes/fallback.tsx"),
] satisfies RouteConfig;
