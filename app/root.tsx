import type { ReactNode } from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
  useRouteLoaderData,
} from "react-router";

import {
  isPublicPathname,
  PUBLIC_THEME,
} from "~/features/public/layout/public-layout.shared";
import { PublicSiteLayout } from "~/features/public/layout/public-site-layout";
import { getThemeFromRequest } from "~/features/public/layout/public-theme.server";

import appStylesHref from "./styles/app.css?url";
import { siteConfig } from "./lib/site";

export function loader({ request }: { request: Request }) {
  return {
    theme: getThemeFromRequest(request),
  };
}

export function links() {
  return [
    { rel: "stylesheet", href: appStylesHref },
    { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
  ];
}

export function Layout({ children }: { children: ReactNode }) {
  const data = useRouteLoaderData<typeof loader>("root");
  const theme = data?.theme ?? PUBLIC_THEME.light;

  return (
    <html
      lang={siteConfig.locale}
      className={theme}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="selection:bg-primary selection:text-primary-foreground" suppressHydrationWarning>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { theme } = useLoaderData<typeof loader>();
  const location = useLocation();
  const content = <Outlet />;

  if (!isPublicPathname(location.pathname)) {
    return content;
  }

  return <PublicSiteLayout theme={theme}>{content}</PublicSiteLayout>;
}

export function ErrorBoundary() {
  return (
    <main className="mx-auto grid min-h-screen max-w-4xl px-4 py-8 md:px-6 lg:py-16">
      <section className="bg-card grid gap-4 border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:p-8 dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]">
        <p className="text-muted-foreground text-sm tracking-[0.08em] uppercase">
          Beklenmeyen durum
        </p>
        <h1 className="font-display text-5xl leading-none md:text-7xl">
          Sayfa yuklenemedi.
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base leading-7 md:text-lg">
          Istek islenirken bir hata olustu. Bu temel iskelet sonraki adimlarda
          zenginlestirilecek.
        </p>
      </section>
    </main>
  );
}
