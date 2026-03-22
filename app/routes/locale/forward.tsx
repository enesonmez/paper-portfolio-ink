import { redirect } from "react-router";
import type { Route } from "./+types/forward";

import {
  buildLocaleCookie,
  buildLocalizedPath,
  getLocaleFromPathname,
} from "~/shared/i18n/i18n.shared";
import { loadI18nRuntimeState } from "~/shared/i18n/i18n.server";

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

export async function loader({ context, request }: Route.LoaderArgs) {
  const { locale, supportedLocaleCodes } = await loadI18nRuntimeState(context, request);
  const url = new URL(request.url);

  if (
    getLocaleFromPathname(url.pathname, supportedLocaleCodes) ||
    !isLegacyUnprefixedPath(url.pathname)
  ) {
    return new Response("Not Found", {
      status: 404,
    });
  }

  const redirectTarget = buildLocalizedPath(
    locale,
    `${url.pathname}${url.search}${url.hash}`,
    supportedLocaleCodes,
  );

  return redirect(redirectTarget, {
    headers: {
      "Set-Cookie": buildLocaleCookie(locale),
    },
  });
}

export default function LocaleForwardRoute() {
  return null;
}
