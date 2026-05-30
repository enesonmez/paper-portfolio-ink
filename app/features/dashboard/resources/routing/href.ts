import type { LocaleResourceRecord } from "~/lib/resources/resources.server";
import { stripLocalePrefix } from "~/shared/i18n/i18n.shared";
import { DASHBOARD_PAGINATION_DIRECTION } from "../../shared/pagination";

type ValueOf<T> = T[keyof T];

export const DASHBOARD_RESOURCES_SECTION = {
  locales: "locales",
  translations: "translations",
} as const;

export type DashboardResourcesSection = ValueOf<typeof DASHBOARD_RESOURCES_SECTION>;

export const DASHBOARD_RESOURCES_PATH = {
  base: "/dashboard/resources",
  locales: "/dashboard/resources/locales",
  translations: "/dashboard/resources/translations",
} as const;

export const DASHBOARD_RESOURCES_QUERY_PARAM = {
  translationCursor: "translationCursor",
  translationDirection: "translationDirection",
  editLocaleCode: "editLocaleCode",
  editTranslationKey: "editTranslationKey",
  editTranslationLocale: "editTranslationLocale",
  modal: "modal",
  translationLocale: "translationLocale",
  translationSearch: "translationSearch",
} as const;

export const DASHBOARD_RESOURCES_MODAL = {
  createLocale: "create-locale",
  createTranslation: "create-translation",
  editLocale: "edit-locale",
  editTranslation: "edit-translation",
} as const;

export type DashboardResourcesModal = ValueOf<typeof DASHBOARD_RESOURCES_MODAL>;

export interface DashboardResourcesHrefParams {
  translationCursor?: string | null;
  translationDirection?: "next" | "previous" | null;
  editLocaleCode?: string | null;
  editTranslationKey?: string | null;
  editTranslationLocale?: string | null;
  modal?: string | null;
  translationLocale?: string | null;
  translationSearch?: string | null;
}

export interface DashboardResourcesTranslationsViewState {
  translationCursor?: string | null;
  translationDirection?: "next" | "previous" | null;
  translationLocale: string;
  translationSearch: string;
}

export const DASHBOARD_RESOURCES_TRANSLATIONS_PAGE_SIZE = 20;

export function normalizeDashboardResourcesSearchQuery(value: string | null) {
  return value?.trim() ?? "";
}

export function resolveDashboardResourcesSection(
  pathname: string,
): DashboardResourcesSection {
  const normalizedPathname = stripLocalePrefix(pathname);

  return normalizedPathname.startsWith(DASHBOARD_RESOURCES_PATH.translations)
    ? DASHBOARD_RESOURCES_SECTION.translations
    : DASHBOARD_RESOURCES_SECTION.locales;
}

export function resolveDashboardResourcesTranslationLocale(
  translationLocale: string | null,
  localeRows: readonly LocaleResourceRecord[],
) {
  if (
    translationLocale &&
    localeRows.some((localeRow) => localeRow.code === translationLocale)
  ) {
    return translationLocale;
  }

  return (
    localeRows.find((localeRow) => localeRow.isDefault)?.code ??
    localeRows[0]?.code ??
    ""
  );
}

function buildDashboardResourcesHref(
  pathname: string,
  params: DashboardResourcesHrefParams = {},
) {
  const searchParams = new URLSearchParams();

  if (params.translationLocale) {
    searchParams.set(
      DASHBOARD_RESOURCES_QUERY_PARAM.translationLocale,
      params.translationLocale,
    );
  }

  if (params.translationCursor) {
    searchParams.set(
      DASHBOARD_RESOURCES_QUERY_PARAM.translationCursor,
      params.translationCursor,
    );
  }

  if (
    params.translationDirection &&
    params.translationDirection !== DASHBOARD_PAGINATION_DIRECTION.next
  ) {
    searchParams.set(
      DASHBOARD_RESOURCES_QUERY_PARAM.translationDirection,
      params.translationDirection,
    );
  }

  const normalizedSearch = normalizeDashboardResourcesSearchQuery(
    params.translationSearch ?? null,
  );

  if (normalizedSearch) {
    searchParams.set(
      DASHBOARD_RESOURCES_QUERY_PARAM.translationSearch,
      normalizedSearch,
    );
  }

  if (params.modal) {
    searchParams.set(DASHBOARD_RESOURCES_QUERY_PARAM.modal, params.modal);
  }

  if (params.editLocaleCode) {
    searchParams.set(
      DASHBOARD_RESOURCES_QUERY_PARAM.editLocaleCode,
      params.editLocaleCode,
    );
  }

  if (params.editTranslationLocale) {
    searchParams.set(
      DASHBOARD_RESOURCES_QUERY_PARAM.editTranslationLocale,
      params.editTranslationLocale,
    );
  }

  if (params.editTranslationKey) {
    searchParams.set(
      DASHBOARD_RESOURCES_QUERY_PARAM.editTranslationKey,
      params.editTranslationKey,
    );
  }

  const search = searchParams.toString();

  return search ? `${pathname}?${search}` : pathname;
}

export function buildDashboardResourcesLocalesHref(
  params: Pick<DashboardResourcesHrefParams, "editLocaleCode" | "modal"> = {},
) {
  return buildDashboardResourcesHref(DASHBOARD_RESOURCES_PATH.locales, params);
}

export function buildDashboardResourcesTranslationsHref(
  state: DashboardResourcesTranslationsViewState,
  overrides: Omit<
    DashboardResourcesHrefParams,
    | "translationCursor"
    | "translationDirection"
    | "translationLocale"
    | "translationSearch"
  > = {},
) {
  return buildDashboardResourcesHref(DASHBOARD_RESOURCES_PATH.translations, {
    ...overrides,
    translationCursor: state.translationCursor,
    translationDirection: state.translationDirection,
    translationLocale: state.translationLocale,
    translationSearch: state.translationSearch,
  });
}
