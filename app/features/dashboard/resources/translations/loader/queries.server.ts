import type { AppLoadContext } from "react-router";

import {
  findTranslation,
  listTranslationsByLocale,
  type LocaleResourceRecord,
} from "~/lib/resources/resources.server";

import { DASHBOARD_RESOURCES_TRANSLATIONS_PAGE_SIZE } from "../../routing/href";
import { buildDashboardResourcesTranslationPagination } from "../../state";
import type { TranslationRequestState } from "./request.server";

export interface LoadedTranslationState {
  pagination: ReturnType<typeof buildDashboardResourcesTranslationPagination>;
  record: Awaited<ReturnType<typeof findTranslation>>;
  rows: Awaited<ReturnType<typeof listTranslationsByLocale>>["rows"];
  searchQuery: string;
  selectedLocale: string;
  selectedLocaleTranslationCount: number;
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

export async function loadDashboardTranslationListing(args: {
  context: AppLoadContext;
  localeRows: readonly LocaleResourceRecord[];
  requestState: TranslationRequestState;
}): Promise<LoadedTranslationState> {
  if (!args.requestState.selectedLocale) {
    return buildEmptyLoadedTranslationState();
  }

  const selectedLocaleTranslationCount =
    args.localeRows.find(
      (localeRow) => localeRow.code === args.requestState.selectedLocale,
    )?.translationCount ?? 0;

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
      totalCountHint: selectedLocaleTranslationCount,
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
    selectedLocaleTranslationCount,
  };
}
