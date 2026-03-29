import type { LocaleResourceRecord } from "~/lib/resources/resources.server";

import {
  DASHBOARD_RESOURCES_MODAL,
  normalizeDashboardResourcesPage,
  normalizeDashboardResourcesSearchQuery,
  resolveDashboardResourcesTranslationLocale,
} from "../../routing/href";

export interface TranslationRequestState {
  editTranslationKey: string | null;
  editTranslationLocale: string | null;
  requestedPage: number;
  searchQuery: string;
  selectedLocale: string;
}

export function sanitizeTranslationModalAccess(
  modal: string | null,
  canReadTranslations: boolean,
) {
  if (
    !canReadTranslations &&
    (modal === DASHBOARD_RESOURCES_MODAL.createTranslation ||
      modal === DASHBOARD_RESOURCES_MODAL.editTranslation)
  ) {
    return null;
  }

  return modal;
}

export function resolveTranslationViewStateFromUrl(args: {
  canReadTranslations: boolean;
  localeRows: readonly LocaleResourceRecord[];
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
