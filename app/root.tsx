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

import { AppI18nProvider } from "~/shared/i18n/i18n-react";
import { loadI18nPayload } from "~/shared/i18n/i18n.server";
import { createTranslator, getSeedMessages } from "~/shared/i18n/i18n.shared";
import {
  isPublicPathname,
  PUBLIC_THEME,
} from "~/features/public/layout/public-layout.shared";
import { PublicSiteLayout } from "~/features/public/layout/public-site-layout";
import { getThemeFromRequest } from "~/features/public/layout/public-theme.server";

import appStylesHref from "./styles/app.css?url";

export async function loader({
  context,
  request,
}: {
  context: Parameters<typeof loadI18nPayload>[0];
  request: Request;
}) {
  const i18n = await loadI18nPayload(context, request);

  return {
    ...i18n,
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
  const locale = data?.locale ?? "tr";

  return (
    <html lang={locale} className={theme} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body
        className="selection:bg-primary selection:text-primary-foreground"
        suppressHydrationWarning
      >
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { locale, messages, supportedLocales, theme } = useLoaderData<typeof loader>();
  const location = useLocation();
  const content = isPublicPathname(location.pathname) ? (
    <PublicSiteLayout theme={theme}>
      <Outlet />
    </PublicSiteLayout>
  ) : (
    <Outlet />
  );

  return (
    <AppI18nProvider value={{ locale, messages, supportedLocales }}>
      {content}
    </AppI18nProvider>
  );
}

export function ErrorBoundary() {
  const data = useRouteLoaderData<typeof loader>("root");
  const t = createTranslator(data?.messages ?? getSeedMessages(data?.locale ?? "tr"));

  return (
    <main className="mx-auto grid min-h-screen max-w-4xl px-4 py-8 md:px-6 lg:py-16">
      <section className="bg-card grid gap-4 border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:p-8 dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]">
        <p className="text-muted-foreground text-sm tracking-[0.08em] uppercase">
          {t("root.error.eyebrow")}
        </p>
        <h1 className="font-display text-5xl leading-none md:text-7xl">
          {t("root.error.title")}
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base leading-7 md:text-lg">
          {t("root.error.body")}
        </p>
      </section>
    </main>
  );
}
