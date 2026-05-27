import type { ReactNode } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
  useRouteError,
  useRouteLoaderData,
} from "react-router";

import { APP_ROUTE_ID } from "~/shared/errors/contracts";
import { AppI18nProvider } from "~/shared/i18n/i18n-react";
import { runLoaderWithErrorHandling } from "~/shared/errors/route-error-handling.server";
import { loadI18nPayload } from "~/shared/i18n/i18n.server";
import { createTranslator, getSeedMessages } from "~/shared/i18n/i18n.shared";
import { loadAccountConfigurationParameters } from "~/lib/configuration/configuration.server";
import {
  APPEARANCE_BODY_FONTS,
  APPEARANCE_HEADING_FONTS,
  APPEARANCE_PRIMARY_COLORS,
} from "~/domain/configuration/model";
import { isPublicPathname } from "~/features/public/layout/routing";
import { PUBLIC_THEME } from "~/features/public/layout/theme";
import { PublicSiteLayout } from "~/features/public/layout/layout";
import { getThemeFromRequest } from "~/features/public/layout/theme.server";

import appStylesHref from "./styles/app.css?url";

export async function loader({
  context,
  request,
}: {
  context: Parameters<typeof loadI18nPayload>[0];
  request: Request;
}) {
  return runLoaderWithErrorHandling({
    context,
    handler: async () => {
      const [configuration, i18n] = await Promise.all([
        loadAccountConfigurationParameters(context, request),
        loadI18nPayload(context, request),
      ]);

      return {
        configuration,
        ...i18n,
        theme: getThemeFromRequest(request),
      };
    },
    request,
    routeId: APP_ROUTE_ID.root,
  });
}

export function links() {
  return [
    { rel: "stylesheet", href: appStylesHref },
    { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
  ];
}

function buildAppearanceStyleOverrides(configuration?: Record<string, string>) {
  if (!configuration) {
    return "";
  }

  const primaryColor =
    configuration["appearance.primaryColor"] || APPEARANCE_PRIMARY_COLORS.yellow;
  const headingFont =
    configuration["appearance.headingFont"] || APPEARANCE_HEADING_FONTS.vt323;
  const bodyFont = configuration["appearance.bodyFont"] || APPEARANCE_BODY_FONTS.mono;

  let primaryHex = "#facc15";
  let ringLight = "#dc2626";
  let ringDark = "#facc15";

  if (primaryColor === APPEARANCE_PRIMARY_COLORS.orange) {
    primaryHex = "#f97316";
    ringLight = "#ea580c";
    ringDark = "#f97316";
  } else if (primaryColor === APPEARANCE_PRIMARY_COLORS.green) {
    primaryHex = "#22c55e";
    ringLight = "#16a34a";
    ringDark = "#22c55e";
  } else if (primaryColor === APPEARANCE_PRIMARY_COLORS.cyan) {
    primaryHex = "#06b6d4";
    ringLight = "#0891b2";
    ringDark = "#06b6d4";
  } else if (primaryColor === APPEARANCE_PRIMARY_COLORS.red) {
    primaryHex = "#ef4444";
    ringLight = "#dc2626";
    ringDark = "#ef4444";
  }

  let fontImports = "";
  let headingFamily = '"VT323", monospace';
  let bodyFamily = '"JetBrains Mono", monospace';

  if (headingFont === APPEARANCE_HEADING_FONTS.outfit) {
    fontImports +=
      "@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');\n";
    headingFamily = '"Outfit", system-ui, sans-serif';
  } else if (headingFont === APPEARANCE_HEADING_FONTS.sans) {
    headingFamily = "system-ui, sans-serif";
  } else if (headingFont === APPEARANCE_HEADING_FONTS.serif) {
    headingFamily = "Georgia, serif";
  }

  if (bodyFont === APPEARANCE_BODY_FONTS.inter) {
    fontImports +=
      "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');\n";
    bodyFamily = '"Inter", system-ui, sans-serif';
  } else if (bodyFont === APPEARANCE_BODY_FONTS.sans) {
    bodyFamily = "system-ui, sans-serif";
  } else if (bodyFont === APPEARANCE_BODY_FONTS.serif) {
    bodyFamily = "Georgia, serif";
  }

  return `
    ${fontImports}
    :root {
      --primary: ${primaryHex};
      --accent: ${primaryHex};
      --ring: ${ringLight};
      --font-sans: ${bodyFamily};
      --font-display: ${headingFamily};
    }
    .dark {
      --primary: ${primaryHex};
      --accent: ${primaryHex};
      --ring: ${ringDark};
    }
  `;
}

export function Layout({ children }: { children: ReactNode }) {
  const data = useRouteLoaderData<typeof loader>("root");
  const theme = data?.theme ?? PUBLIC_THEME.light;
  const locale = data?.locale ?? "tr";
  const appearanceStyles = buildAppearanceStyleOverrides(data?.configuration);

  return (
    <html lang={locale} className={theme} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        {appearanceStyles ? (
          <style dangerouslySetInnerHTML={{ __html: appearanceStyles }} />
        ) : null}
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
  const error = useRouteError();
  const requestId = getRequestIdFromRouteError(error);

  return (
    <main className="mx-auto grid min-h-screen max-w-4xl px-4 py-8 md:px-6 lg:py-16">
      <section className="bg-card grid gap-4 border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:p-8">
        <p className="text-muted-foreground text-sm tracking-[0.08em] uppercase">
          {t("root.error.eyebrow")}
        </p>
        <h1 className="font-display text-5xl leading-none md:text-7xl">
          {t("root.error.title")}
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base leading-7 md:text-lg">
          {t("root.error.body")}
        </p>
        {requestId ? (
          <p className="font-sans text-xs font-bold tracking-[0.12em] uppercase">
            Request ID: {requestId}
          </p>
        ) : null}
      </section>
    </main>
  );
}

function isRootErrorPayload(
  value: unknown,
): value is { error?: { requestId?: string | null } } {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    (typeof value.error === "object" || typeof value.error === "undefined") &&
    value.error !== null
  );
}

function getRequestIdFromRouteError(error: unknown) {
  if (!isRouteErrorResponse(error)) {
    return null;
  }

  const errorData: unknown = error.data;

  if (!isRootErrorPayload(errorData)) {
    return null;
  }

  const payload = errorData.error;

  if (!payload || typeof payload !== "object") {
    return null;
  }

  return typeof payload.requestId === "string" ? payload.requestId : null;
}
