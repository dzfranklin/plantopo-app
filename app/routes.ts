import {
  type RouteConfig,
  index,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  ...prefix("api", [
    route("health", "routes/api/health.ts"),
    route("auth/*", "routes/api/auth.ts"),
  ]),
] satisfies RouteConfig;
