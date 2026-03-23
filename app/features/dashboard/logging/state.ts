import type {
  listLogErrorHistoryEntries,
  listLogHistoryEntries,
} from "~/lib/logging/logs.server";

export const DASHBOARD_LOGGING_TAB = {
  errors: "errors",
  history: "history",
} as const;

export type DashboardLoggingTab =
  (typeof DASHBOARD_LOGGING_TAB)[keyof typeof DASHBOARD_LOGGING_TAB];

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
  permissions: {
    canDelete: boolean;
    canExport: boolean;
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
  permissions: {
    canDelete: false;
    canExport: false;
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
    permissions: {
      canDelete: false,
      canExport: false,
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
  errorEntries: Awaited<ReturnType<typeof listLogErrorHistoryEntries>>;
  historyEntries: Awaited<ReturnType<typeof listLogHistoryEntries>>;
  permissions: DashboardLoggingGrantedLoaderData["permissions"];
  selectedTab: DashboardLoggingTab;
  totals: DashboardLoggingGrantedLoaderData["totals"];
}): DashboardLoggingGrantedLoaderData {
  return {
    access: "granted",
    entries: {
      errors: args.errorEntries,
      history: args.historyEntries,
    },
    permissions: args.permissions,
    rangeForm: buildEmptyRangeFormState(),
    selectedTab: args.selectedTab,
    totals: args.totals,
  };
}

export function buildDashboardLoggingHref(tab: DashboardLoggingTab) {
  return `/dashboard/logging?tab=${tab}`;
}
