import { Outlet, redirect } from "react-router";
import type { Route } from "./+types/layout";

import { loadI18nRuntimeState } from "~/shared/i18n/i18n.server";
import {
  buildLocaleCookie,
  buildLocalizedPath,
  isSupportedLocale,
} from "~/shared/i18n/i18n.shared";

const LEGACY_ROUTE_PREFIXES = [
  "/blog",
  "/dashboard",
  "/locale",
  "/login",
  "/logout",
  "/projects",
  "/theme",
] as const;

function isLegacyUnprefixedPath(pathname: string) {
  return LEGACY_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

class LocaleNotFoundError extends Error {
  status = 404;

  constructor() {
    super("Not Found");
  }
}

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const { locale, supportedLocaleCodes } = await loadI18nRuntimeState(context, request);

  if (!isSupportedLocale(params.locale, supportedLocaleCodes)) {
    const url = new URL(request.url);

    if (isLegacyUnprefixedPath(url.pathname)) {
      return redirect(
        buildLocalizedPath(
          locale,
          `${url.pathname}${url.search}${url.hash}`,
          supportedLocaleCodes,
        ),
        {
          headers: {
            "Set-Cookie": buildLocaleCookie(locale),
          },
        },
      );
    }

    throw new LocaleNotFoundError();
  }

  return {
    locale: params.locale.toLowerCase(),
  };
}

export default function LocalePrefixRoute() {
  return <Outlet />;
}
