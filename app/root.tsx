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
    <main className="page-shell">
      <section className="panel">
        <p className="eyebrow">Beklenmeyen durum</p>
        <h1>Sayfa yuklenemedi.</h1>
        <p>
          Istek islenirken bir hata olustu. Bu temel iskelet sonraki adimlarda
          zenginlestirilecek.
        </p>
      </section>
    </main>
  );
}
