import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  route("api/auth/*", "./routes/system/api-auth.ts"),
  route("favicon.ico", "./routes/system/favicon.ts"),
  route(
    ".well-known/appspecific.com.chrome.devtools.json",
    "./routes/system/chrome-devtools.ts",
  ),
  index("./routes/locale/index.tsx"),
  route(":locale", "./routes/locale/layout.tsx", [
    index("./routes/public/home.tsx"),
    route("blog", "./routes/public/blog/index.tsx"),
    route("blog/feed", "./routes/public/blog/feed.tsx"),
    route("blog/track", "./routes/public/blog/track.ts"),
    route("blog/:slug", "./routes/public/blog/$slug.tsx"),
    route("dashboard", "./routes/dashboard/layout.tsx", [
      index("./routes/dashboard/index.tsx"),
      route("analytics", "./routes/dashboard/analytics.tsx"),
      route("posts", "./routes/dashboard/posts.tsx"),
      route("projects", "./routes/dashboard/projects.tsx"),
      route("resources", "./routes/dashboard/resources/layout.tsx", [
        index("./routes/dashboard/resources/index.tsx"),
        route("locales", "./routes/dashboard/resources/locales.tsx"),
        route("translations", "./routes/dashboard/resources/translations.tsx"),
      ]),
      route("settings", "./routes/dashboard/settings.tsx"),
      route("skills", "./routes/dashboard/skills.tsx"),
      route("users", "./routes/dashboard/users.tsx"),
      route("logging/export", "./routes/dashboard/logging-export.ts"),
      route("logging", "./routes/dashboard/logging.tsx"),
    ]),
    route("locale", "./routes/locale/action.tsx"),
    route("login", "./routes/auth/login.tsx"),
    route("logout", "./routes/auth/logout.tsx"),
    route("projects", "./routes/public/projects/index.tsx"),
    route("projects/feed", "./routes/public/projects/feed.tsx"),
    route("theme", "./routes/public/theme.tsx"),
  ]),
  route("*", "./routes/locale/forward.tsx"),
] satisfies RouteConfig;
