import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";
import { SIGN_IN_PATHNAME, SIGN_OUT_PATHNAME } from "./auth/consts";
import { getCommonLayoutFilePath, getCommonPageFilePath } from "./features/common/consts";
import { getSandboxPageFilePath } from "./features/sandbox/common";
import { getUserLayoutFilePath, getUserPageFilePath } from "./features/user/consts";

export default [
  layout(getCommonLayoutFilePath("layout.tsx"), [
    index(getCommonPageFilePath("index.tsx")),
    // ...prefix("/:lang", [
    //   index(getCommonPageFilePath("language.tsx")),
    // ]),
    route(SIGN_IN_PATHNAME, getUserPageFilePath("sign-in.tsx")),
    route(SIGN_OUT_PATHNAME, getUserPageFilePath("sign-out.tsx")),
    layout(getUserLayoutFilePath("layout.tsx"), [
      route("home", getUserPageFilePath("home.tsx")),
      route("settings", getUserPageFilePath("settings.tsx")),
    ]),
    ...prefix("api", [
    ]),
    route("csp-report", getCommonPageFilePath("csp-report.tsx")),
    route("health", getCommonPageFilePath("health.ts")),
    route("auth/*", "auth/page.ts"),
    ...prefix("sandbox", [
      index(getSandboxPageFilePath("page.tsx")),
      route("/api", getSandboxPageFilePath("api.ts")),
      route("/api/:id", getSandboxPageFilePath("api-detail.ts")),
      route("/stream", getSandboxPageFilePath("stream-api.ts")),
    ]),
    route("*", getCommonPageFilePath("fallback.tsx")),
  ]),
] satisfies RouteConfig;
