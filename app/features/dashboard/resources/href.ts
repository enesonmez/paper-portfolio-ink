import { stripLocalePrefix } from "~/shared/i18n/i18n.shared";
import type { LocaleResourceRecord } from "~/lib/resources/resources.server";

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
  editLocaleCode: "editLocaleCode",
  editTranslationKey: "editTranslationKey",
  editTranslationLocale: "editTranslationLocale",
  modal: "modal",
  translationLocale: "translationLocale",
  translationPage: "translationPage",
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
  editLocaleCode?: string | null;
  editTranslationKey?: string | null;
  editTranslationLocale?: string | null;
  modal?: string | null;
  translationLocale?: string | null;
  translationPage?: number | null;
  translationSearch?: string | null;
}

export interface DashboardResourcesTranslationsViewState {
  translationLocale: string;
  translationPage?: number | null;
  translationSearch: string;
}

export const DASHBOARD_RESOURCES_TRANSLATIONS_PAGE_SIZE = 20;

export function normalizeDashboardResourcesSearchQuery(value: string | null) {
  return value?.trim() ?? "";
}

export function normalizeDashboardResourcesPage(value: string | null) {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return 1;
  }

  return parsedValue;
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

  if (params.translationPage && params.translationPage > 1) {
    searchParams.set(
      DASHBOARD_RESOURCES_QUERY_PARAM.translationPage,
      params.translationPage.toString(),
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
    "translationLocale" | "translationPage" | "translationSearch"
  > = {},
) {
  return buildDashboardResourcesHref(DASHBOARD_RESOURCES_PATH.translations, {
    ...overrides,
    translationLocale: state.translationLocale,
    translationPage: state.translationPage,
    translationSearch: state.translationSearch,
  });
}
