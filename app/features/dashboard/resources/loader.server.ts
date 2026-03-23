import type { AppLoadContext } from "react-router";

import {
  findTranslation,
  listLocales,
  listTranslationsByLocale,
} from "~/lib/resources/resources.server";

import {
  DASHBOARD_RESOURCES_MODAL,
  DASHBOARD_RESOURCES_SECTION,
  DASHBOARD_RESOURCES_TRANSLATIONS_PAGE_SIZE,
  normalizeDashboardResourcesPage,
  normalizeDashboardResourcesSearchQuery,
  resolveDashboardResourcesSection,
  resolveDashboardResourcesTranslationLocale,
} from "./href";
import { getRequestedOrFallbackLocale, redirectToResources } from "./navigation.server";
import {
  canReadResourceSection,
  type DashboardResourcesPermissions,
} from "./permissions";
import {
  buildDashboardResourcesMetrics,
  buildDashboardResourcesTranslationPagination,
  resolveDashboardResourcesState,
  type DashboardResourcesLoaderData,
} from "./state";

interface TranslationRequestState {
  editTranslationKey: string | null;
  editTranslationLocale: string | null;
  requestedPage: number;
  searchQuery: string;
  selectedLocale: string;
}

interface LoadedTranslationState {
  pagination: ReturnType<typeof buildDashboardResourcesTranslationPagination>;
  record: Awaited<ReturnType<typeof findTranslation>>;
  rows: Awaited<ReturnType<typeof listTranslationsByLocale>>["rows"];
  searchQuery: string;
  selectedLocale: string;
  selectedLocaleTranslationCount: number;
}

function sanitizeResourcesModal(modal: string | null, canReadTranslations: boolean) {
  if (
    !canReadTranslations &&
    (modal === DASHBOARD_RESOURCES_MODAL.createTranslation ||
      modal === DASHBOARD_RESOURCES_MODAL.editTranslation)
  ) {
    return null;
  }

  return modal;
}

function buildEmptyLoadedTranslationState(): LoadedTranslationState {
  return {
    pagination: buildDashboardResourcesTranslationPagination({
      currentPage: 1,
      pageSize: DASHBOARD_RESOURCES_TRANSLATIONS_PAGE_SIZE,
      totalItems: 0,
    }),
    record: null,
    rows: [],
    searchQuery: "",
    selectedLocale: "",
    selectedLocaleTranslationCount: 0,
  };
}

function resolveAccessibleResourcesSection(permissions: DashboardResourcesPermissions) {
  return permissions.translations.canRead
    ? DASHBOARD_RESOURCES_SECTION.translations
    : DASHBOARD_RESOURCES_SECTION.locales;
}

function resolveTranslationRequestState(args: {
  canReadTranslations: boolean;
  localeRows: Awaited<ReturnType<typeof listLocales>>;
  url: URL;
}): TranslationRequestState {
  if (!args.canReadTranslations) {
    return {
      editTranslationKey: null,
      editTranslationLocale: null,
      requestedPage: 1,
      searchQuery: "",
      selectedLocale: "",
    };
  }

  return {
    editTranslationKey: args.url.searchParams.get("editTranslationKey"),
    editTranslationLocale: args.url.searchParams.get("editTranslationLocale"),
    requestedPage: normalizeDashboardResourcesPage(
      args.url.searchParams.get("translationPage"),
    ),
    searchQuery: normalizeDashboardResourcesSearchQuery(
      args.url.searchParams.get("translationSearch"),
    ),
    selectedLocale: resolveDashboardResourcesTranslationLocale(
      args.url.searchParams.get("translationLocale"),
      args.localeRows,
    ),
  };
}

async function loadTranslationState(args: {
  context: AppLoadContext;
  localeRows: Awaited<ReturnType<typeof listLocales>>;
  requestState: TranslationRequestState;
}): Promise<LoadedTranslationState> {
  if (!args.requestState.selectedLocale) {
    return buildEmptyLoadedTranslationState();
  }

  const [record, page] = await Promise.all([
    args.requestState.editTranslationLocale && args.requestState.editTranslationKey
      ? findTranslation(
          args.context.db,
          args.requestState.editTranslationLocale,
          args.requestState.editTranslationKey,
        )
      : Promise.resolve(null),
    listTranslationsByLocale(args.context.db, args.requestState.selectedLocale, {
      page: args.requestState.requestedPage,
      pageSize: DASHBOARD_RESOURCES_TRANSLATIONS_PAGE_SIZE,
      searchQuery: args.requestState.searchQuery,
    }),
  ]);

  return {
    pagination: buildDashboardResourcesTranslationPagination({
      currentPage: page.currentPage,
      pageSize: DASHBOARD_RESOURCES_TRANSLATIONS_PAGE_SIZE,
      totalItems: page.totalCount,
    }),
    record,
    rows: page.rows,
    searchQuery: args.requestState.searchQuery,
    selectedLocale: args.requestState.selectedLocale,
    selectedLocaleTranslationCount:
      args.localeRows.find(
        (localeRow) => localeRow.code === args.requestState.selectedLocale,
      )?.translationCount ?? 0,
  };
}

export async function loadGrantedDashboardResourcesData(args: {
  context: AppLoadContext;
  permissions: DashboardResourcesPermissions;
  request: Request;
}): Promise<DashboardResourcesLoaderData | Response> {
  const localeRows = await listLocales(args.context.db);
  const url = new URL(args.request.url);
  const currentSection = resolveDashboardResourcesSection(url.pathname);
  const canReadTranslations = args.permissions.translations.canRead;
  const sanitizedModal = sanitizeResourcesModal(
    url.searchParams.get("modal"),
    canReadTranslations,
  );

  if (!canReadResourceSection(args.permissions, currentSection)) {
    return redirectToResources({
      currentLocale: getRequestedOrFallbackLocale(args.request, localeRows),
      localeRows,
      section: resolveAccessibleResourcesSection(args.permissions),
      translationLocale: resolveDashboardResourcesTranslationLocale(null, localeRows),
      translationSearch: "",
    });
  }

  const translationRequestState = resolveTranslationRequestState({
    canReadTranslations,
    localeRows,
    url,
  });
  const translationState = await loadTranslationState({
    context: args.context,
    localeRows,
    requestState: translationRequestState,
  });
  const { localeForm, translationForm } = resolveDashboardResourcesState({
    editLocaleCode: url.searchParams.get("editLocaleCode"),
    editTranslationKey: translationRequestState.editTranslationKey,
    editTranslationLocale: translationRequestState.editTranslationLocale,
    localeRows,
    modal: sanitizedModal,
    selectedTranslationLocale: translationState.selectedLocale,
    translationRecord: translationState.record,
  });

  return {
    access: "granted",
    localeForm,
    locales: localeRows,
    metrics: buildDashboardResourcesMetrics(
      localeRows,
      translationState.selectedLocaleTranslationCount,
    ),
    permissions: args.permissions,
    selectedTranslationLocale: translationState.selectedLocale,
    translationPagination: translationState.pagination,
    translationSearchQuery: translationState.searchQuery,
    translationForm,
    translations: translationState.rows,
  };
}
