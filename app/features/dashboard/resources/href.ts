import type { LocaleResourceRecord } from "~/lib/resources/resources.server";

type ValueOf<T> = T[keyof T];

export const DASHBOARD_RESOURCES_TAB = {
  locales: "locales",
  translations: "translations",
} as const;

export type DashboardResourcesTab = ValueOf<typeof DASHBOARD_RESOURCES_TAB>;

export const DASHBOARD_RESOURCES_QUERY_PARAM = {
  editLocaleCode: "editLocaleCode",
  editTranslationKey: "editTranslationKey",
  editTranslationLocale: "editTranslationLocale",
  modal: "modal",
  tab: "tab",
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
  tab?: DashboardResourcesTab | null;
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

export function resolveDashboardResourcesTab(
  tab: string | null,
): DashboardResourcesTab {
  return tab === DASHBOARD_RESOURCES_TAB.translations
    ? DASHBOARD_RESOURCES_TAB.translations
    : DASHBOARD_RESOURCES_TAB.locales;
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

export function buildDashboardResourcesHref(params: DashboardResourcesHrefParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.tab) {
    searchParams.set(DASHBOARD_RESOURCES_QUERY_PARAM.tab, params.tab);
  }

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

  return search ? `/dashboard/resources?${search}` : "/dashboard/resources";
}

export function buildDashboardResourcesTranslationsHref(
  state: DashboardResourcesTranslationsViewState,
  overrides: Omit<
    DashboardResourcesHrefParams,
    "tab" | "translationLocale" | "translationPage" | "translationSearch"
  > = {},
) {
  return buildDashboardResourcesHref({
    ...overrides,
    tab: DASHBOARD_RESOURCES_TAB.translations,
    translationLocale: state.translationLocale,
    translationPage: state.translationPage,
    translationSearch: state.translationSearch,
  });
}
