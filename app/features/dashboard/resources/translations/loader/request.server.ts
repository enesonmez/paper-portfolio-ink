import type { LocaleResourceRecord } from "~/lib/resources/resources.server";

import {
  DASHBOARD_RESOURCES_QUERY_PARAM,
  DASHBOARD_RESOURCES_MODAL,
  normalizeDashboardResourcesSearchQuery,
  resolveDashboardResourcesTranslationLocale,
} from "../../routing/href";

export interface TranslationRequestState {
  cursor: string | null;
  direction: "next" | "previous";
  editTranslationKey: string | null;
  editTranslationLocale: string | null;
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
      cursor: null,
      direction: "next",
      editTranslationKey: null,
      editTranslationLocale: null,
      searchQuery: "",
      selectedLocale: "",
    };
  }

  return {
    cursor: args.url.searchParams.get(
      DASHBOARD_RESOURCES_QUERY_PARAM.translationCursor,
    ),
    direction:
      args.url.searchParams.get(
        DASHBOARD_RESOURCES_QUERY_PARAM.translationDirection,
      ) === "previous"
        ? "previous"
        : "next",
    editTranslationKey: args.url.searchParams.get(
      DASHBOARD_RESOURCES_QUERY_PARAM.editTranslationKey,
    ),
    editTranslationLocale: args.url.searchParams.get(
      DASHBOARD_RESOURCES_QUERY_PARAM.editTranslationLocale,
    ),
    searchQuery: normalizeDashboardResourcesSearchQuery(
      args.url.searchParams.get(DASHBOARD_RESOURCES_QUERY_PARAM.translationSearch),
    ),
    selectedLocale: resolveDashboardResourcesTranslationLocale(
      args.url.searchParams.get(DASHBOARD_RESOURCES_QUERY_PARAM.translationLocale),
      args.localeRows,
    ),
  };
}
