import type { ReactNode } from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import appStylesHref from "./styles/app.css?url";
import { siteConfig } from "./lib/site";

export function links() {
  return [
    { rel: "stylesheet", href: appStylesHref },
    { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
  ];
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang={siteConfig.locale} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body suppressHydrationWarning>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  return (
    <main className="mx-auto grid min-h-screen max-w-4xl px-4 py-8 md:px-6 lg:py-16">
      <section className="grid gap-4 border-2 border-black bg-card p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)] md:p-8">
        <p className="text-sm uppercase tracking-[0.08em] text-muted-foreground">
          Beklenmeyen durum
        </p>
        <h1 className="font-display text-5xl leading-none md:text-7xl">
          Sayfa yuklenemedi.
        </h1>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
          Istek islenirken bir hata olustu. Bu temel iskelet sonraki adimlarda
          zenginlestirilecek.
        </p>
      </section>
    </main>
  );
}
