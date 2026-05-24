import type {
  loadDashboardLoggingOverview,
  listLogErrorHistoryEntries,
  listLogHistoryEntries,
} from "~/lib/logging/logs.server";
import {
  LOGGING_PAGINATION_DIRECTION,
  LOGGING_QUERY_PARAM,
  type LoggingPaginationDirection,
} from "~/domain/logging/model";

export const DASHBOARD_LOGGING_TAB = {
  errors: "errors",
  history: "history",
} as const;

export type DashboardLoggingTab =
  (typeof DASHBOARD_LOGGING_TAB)[keyof typeof DASHBOARD_LOGGING_TAB];

export interface DashboardLoggingPaginationState {
  direction: LoggingPaginationDirection;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextCursor: string | null;
  pageSize: number;
  previousCursor: string | null;
}

export interface DashboardLoggingRangeFormState {
  errors?: {
    endAt?: string;
    form?: string;
    startAt?: string;
  };
  values: {
    endAt: string;
    startAt: string;
  };
}

export interface DashboardLoggingGrantedLoaderData {
  access: "granted";
  entries: {
    errors: Awaited<ReturnType<typeof listLogErrorHistoryEntries>>;
    history: Awaited<ReturnType<typeof listLogHistoryEntries>>;
  };
  pagination: {
    errors: DashboardLoggingPaginationState;
    history: DashboardLoggingPaginationState;
  };
  permissions: {
    canDeleteErrors: boolean;
    canDeleteHistory: boolean;
    canExportErrors: boolean;
    canExportHistory: boolean;
    canReadErrors: boolean;
    canReadHistory: boolean;
  };
  rangeForm: DashboardLoggingRangeFormState;
  selectedTab: DashboardLoggingTab;
  totals: {
    errors: number;
    history: number;
  };
}

export interface DashboardLoggingDeniedLoaderData {
  access: "denied";
  entries: {
    errors: [];
    history: [];
  };
  pagination: {
    errors: DashboardLoggingPaginationState;
    history: DashboardLoggingPaginationState;
  };
  permissions: {
    canDeleteErrors: false;
    canDeleteHistory: false;
    canExportErrors: false;
    canExportHistory: false;
    canReadErrors: false;
    canReadHistory: false;
  };
  rangeForm: DashboardLoggingRangeFormState;
  selectedTab: DashboardLoggingTab;
  totals: {
    errors: 0;
    history: 0;
  };
}

export type DashboardLoggingLoaderData =
  | DashboardLoggingDeniedLoaderData
  | DashboardLoggingGrantedLoaderData;

export interface DashboardLoggingActionData {
  notice?: string;
  rangeForm?: DashboardLoggingRangeFormState;
}

export function buildEmptyRangeFormState(): DashboardLoggingRangeFormState {
  return {
    values: {
      endAt: "",
      startAt: "",
    },
  };
}

export function buildDashboardLoggingPaginationState(
  direction: LoggingPaginationDirection = LOGGING_PAGINATION_DIRECTION.next,
): DashboardLoggingPaginationState {
  return {
    direction,
    hasNextPage: false,
    hasPreviousPage: false,
    nextCursor: null,
    pageSize: 0,
    previousCursor: null,
  };
}

export function mergeDashboardLoggingRangeFormState(
  loaderForm: DashboardLoggingRangeFormState,
  actionData?: DashboardLoggingActionData,
): DashboardLoggingRangeFormState {
  return actionData?.rangeForm ?? loaderForm;
}

export function normalizeLoggingTab(value: string | null): DashboardLoggingTab {
  return value === DASHBOARD_LOGGING_TAB.errors
    ? DASHBOARD_LOGGING_TAB.errors
    : DASHBOARD_LOGGING_TAB.history;
}

export function buildDeniedLoaderData(): DashboardLoggingLoaderData {
  return {
    access: "denied",
    entries: {
      errors: [],
      history: [],
    },
    pagination: {
      errors: buildDashboardLoggingPaginationState(),
      history: buildDashboardLoggingPaginationState(),
    },
    permissions: {
      canDeleteErrors: false,
      canDeleteHistory: false,
      canExportErrors: false,
      canExportHistory: false,
      canReadErrors: false,
      canReadHistory: false,
    },
    rangeForm: buildEmptyRangeFormState(),
    selectedTab: DASHBOARD_LOGGING_TAB.history,
    totals: {
      errors: 0,
      history: 0,
    },
  };
}

export function buildGrantedLoggingLoaderData(args: {
  errorPage: Awaited<ReturnType<typeof loadDashboardLoggingOverview>>["errorPage"];
  historyPage: Awaited<ReturnType<typeof loadDashboardLoggingOverview>>["historyPage"];
  permissions: DashboardLoggingGrantedLoaderData["permissions"];
  selectedTab: DashboardLoggingTab;
  totals: DashboardLoggingGrantedLoaderData["totals"];
}): DashboardLoggingGrantedLoaderData {
  return {
    access: "granted",
    entries: {
      errors: args.errorPage.entries,
      history: args.historyPage.entries,
    },
    pagination: {
      errors: args.errorPage.pagination,
      history: args.historyPage.pagination,
    },
    permissions: args.permissions,
    rangeForm: buildEmptyRangeFormState(),
    selectedTab: args.selectedTab,
    totals: args.totals,
  };
}

export function resolveAccessibleLoggingTab(args: {
  canReadErrors: boolean;
  canReadHistory: boolean;
  requestedTab: DashboardLoggingTab;
}): DashboardLoggingTab {
  if (args.requestedTab === DASHBOARD_LOGGING_TAB.history && args.canReadHistory) {
    return DASHBOARD_LOGGING_TAB.history;
  }

  if (args.requestedTab === DASHBOARD_LOGGING_TAB.errors && args.canReadErrors) {
    return DASHBOARD_LOGGING_TAB.errors;
  }

  if (args.canReadHistory) {
    return DASHBOARD_LOGGING_TAB.history;
  }

  return DASHBOARD_LOGGING_TAB.errors;
}

export function buildDashboardLoggingHref(args: {
  cursor?: string | null;
  direction?: LoggingPaginationDirection | null;
  tab: DashboardLoggingTab;
}) {
  const searchParams = new URLSearchParams({
    [LOGGING_QUERY_PARAM.tab]: args.tab,
  });

  if (args.cursor) {
    searchParams.set(LOGGING_QUERY_PARAM.cursor, args.cursor);
  }

  if (args.direction) {
    searchParams.set(LOGGING_QUERY_PARAM.direction, args.direction);
  }

  return `/dashboard/logging?${searchParams.toString()}`;
}
