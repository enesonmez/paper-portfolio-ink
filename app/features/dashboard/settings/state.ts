export const DASHBOARD_SETTINGS_TAB = {
  account: "account",
  appearance: "appearance",
  runtime: "runtime",
  security: "security",
} as const;

export type DashboardSettingsTab =
  (typeof DASHBOARD_SETTINGS_TAB)[keyof typeof DASHBOARD_SETTINGS_TAB];

export interface DashboardSettingsGrantedLoaderData {
  access: "granted";
  selectedTab: DashboardSettingsTab;
}

export interface DashboardSettingsDeniedLoaderData {
  access: "denied";
  selectedTab: DashboardSettingsTab;
}

export type DashboardSettingsLoaderData =
  | DashboardSettingsDeniedLoaderData
  | DashboardSettingsGrantedLoaderData;

export function normalizeDashboardSettingsTab(
  value: string | null,
): DashboardSettingsTab {
  switch (value) {
    case DASHBOARD_SETTINGS_TAB.appearance:
      return DASHBOARD_SETTINGS_TAB.appearance;
    case DASHBOARD_SETTINGS_TAB.security:
      return DASHBOARD_SETTINGS_TAB.security;
    case DASHBOARD_SETTINGS_TAB.runtime:
      return DASHBOARD_SETTINGS_TAB.runtime;
    default:
      return DASHBOARD_SETTINGS_TAB.account;
  }
}

export function buildDashboardSettingsHref(tab: DashboardSettingsTab) {
  const searchParams = new URLSearchParams({
    tab,
  });

  return `/dashboard/settings?${searchParams.toString()}`;
}

export function buildDeniedDashboardSettingsLoaderData(): DashboardSettingsDeniedLoaderData {
  return {
    access: "denied",
    selectedTab: DASHBOARD_SETTINGS_TAB.account,
  };
}
