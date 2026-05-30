import type { AppLoadContext } from "react-router";

import {
  findTranslation,
  listTranslationsByLocale,
  normalizeTranslationPaginationDirection,
  parseTranslationCursor,
  type LocaleResourceRecord,
} from "~/lib/resources/resources.server";

import { DASHBOARD_RESOURCES_TRANSLATIONS_PAGE_SIZE } from "../../routing/href";
import { buildDashboardResourcesTranslationPagination } from "../../state";
import { DASHBOARD_PAGINATION_DIRECTION } from "../../../shared/pagination";
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
      currentCursor: null,
      direction: DASHBOARD_PAGINATION_DIRECTION.next,
      hasNextPage: false,
      hasPreviousPage: false,
      nextCursor: null,
      pageSize: DASHBOARD_RESOURCES_TRANSLATIONS_PAGE_SIZE,
      previousCursor: null,
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
      cursor: parseTranslationCursor(args.requestState.cursor),
      direction: normalizeTranslationPaginationDirection(args.requestState.direction),
      pageSize: DASHBOARD_RESOURCES_TRANSLATIONS_PAGE_SIZE,
      searchQuery: args.requestState.searchQuery,
      totalCountHint: selectedLocaleTranslationCount,
    }),
  ]);

  return {
    pagination: buildDashboardResourcesTranslationPagination({
      currentCursor: args.requestState.cursor,
      direction: args.requestState.direction,
      hasNextPage: page.hasNextPage,
      hasPreviousPage: page.hasPreviousPage,
      nextCursor: page.nextCursor,
      pageSize: DASHBOARD_RESOURCES_TRANSLATIONS_PAGE_SIZE,
      previousCursor: page.previousCursor,
      totalItems: page.totalCount,
    }),
    record,
    rows: page.rows,
    searchQuery: args.requestState.searchQuery,
    selectedLocale: args.requestState.selectedLocale,
    selectedLocaleTranslationCount,
  };
}
