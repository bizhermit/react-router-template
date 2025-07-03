import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  // ...prefix("/:lang", [
  //   index("routes/language.tsx"),
  //   route("home", "routes/home/page.tsx"),
  //   route("web-form", "routes/web-form/page.tsx"),
  // ]),
  route("csp-report", "routes/csp-report.tsx"),
  route("*", "routes/fallback.tsx"),
] satisfies RouteConfig;
