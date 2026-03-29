import { redirect } from "react-router";

import type { LocaleResourceRecord } from "~/lib/resources/resources.server";
import { buildLocalizedPath, getLocaleFromPathname } from "~/shared/i18n/i18n.shared";

import {
  DASHBOARD_RESOURCES_SECTION,
  buildDashboardResourcesLocalesHref,
  buildDashboardResourcesTranslationsHref,
} from "./href";

export function toActiveLocaleCodes(localeRows: readonly LocaleResourceRecord[]) {
  return localeRows
    .filter((localeRow) => localeRow.isActive)
    .map((localeRow) => localeRow.code);
}

function pickRedirectLocale(
  currentLocale: string,
  localeRows: readonly LocaleResourceRecord[],
) {
  const activeLocales = localeRows.filter((localeRow) => localeRow.isActive);

  return (
    activeLocales.find((localeRow) => localeRow.code === currentLocale)?.code ??
    activeLocales.find((localeRow) => localeRow.isDefault)?.code ??
    activeLocales[0]?.code ??
    currentLocale
  );
}

export function pickNextDefaultLocaleCode(
  localeRows: readonly LocaleResourceRecord[],
  excludedCode: string,
) {
  return (
    localeRows.find(
      (localeRow) => localeRow.code !== excludedCode && localeRow.isActive,
    )?.code ?? null
  );
}

export function buildLocaleCodeUnion(...collections: readonly string[][]) {
  return Array.from(new Set(collections.flat().filter(Boolean)));
}

export function getRequestedLocaleFromPathname(request: Request) {
  return getLocaleFromPathname(new URL(request.url).pathname);
}

export function getRequestedOrFallbackLocale(
  request: Request,
  localeRows: readonly LocaleResourceRecord[],
) {
  return getRequestedLocaleFromPathname(request) ?? localeRows[0]?.code ?? "tr";
}

export function redirectToResources(args: {
  currentLocale: string;
  localeRows: readonly LocaleResourceRecord[];
  preferredLocale?: string;
  section: "locales" | "translations";
  translationLocale?: string;
  translationSearch?: string;
}) {
  const redirectLocale = pickRedirectLocale(
    args.preferredLocale ?? args.currentLocale,
    args.localeRows,
  );
  const supportedLocaleCodes = toActiveLocaleCodes(args.localeRows);

  return redirect(
    buildLocalizedPath(
      redirectLocale,
      args.section === DASHBOARD_RESOURCES_SECTION.translations
        ? buildDashboardResourcesTranslationsHref({
            translationLocale: args.translationLocale ?? redirectLocale,
            translationSearch: args.translationSearch ?? "",
          })
        : buildDashboardResourcesLocalesHref(),
      supportedLocaleCodes,
    ),
  );
}
