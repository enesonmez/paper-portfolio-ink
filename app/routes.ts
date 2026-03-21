import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  route("api/auth/*", "./routes/api.auth.$.ts"),
  route("favicon.ico", "./routes/favicon[.]ico.ts"),
  route(
    ".well-known/appspecific.com.chrome.devtools.json",
    "./routes/[.]well-known.appspecific.com[.]chrome[.]devtools[.]json.ts",
  ),
  index("./routes/locale-index.tsx"),
  route(":locale", "./routes/locale-prefix.tsx", [
    index("./routes/_index.tsx"),
    route("blog", "./routes/blog.tsx"),
    route("blog/feed", "./routes/blog.feed.tsx"),
    route("blog/:slug", "./routes/blog_.$slug.tsx"),
    route("dashboard", "./routes/dashboard.tsx", [
      index("./routes/dashboard._index.tsx"),
      route("posts", "./routes/dashboard.posts.tsx"),
      route("projects", "./routes/dashboard.projects.tsx"),
      route("skills", "./routes/dashboard.skills.tsx"),
      route("users", "./routes/dashboard.users.tsx"),
    ]),
    route("locale", "./routes/locale.tsx"),
    route("login", "./routes/login.tsx"),
    route("logout", "./routes/logout.tsx"),
    route("projects", "./routes/projects.tsx"),
    route("projects/feed", "./routes/projects.feed.tsx"),
    route("theme", "./routes/theme.tsx"),
  ]),
  route("*", "./routes/locale-forward.tsx"),
] satisfies RouteConfig;
