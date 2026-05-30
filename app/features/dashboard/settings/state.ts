import {
  buildAccountConfigurationFormValues,
  type AccountConfigurationFormState,
  type AccountConfigurationFormValues,
} from "~/domain/configuration/form";
import {
  getDefaultAccountConfigurationRecord,
  isAccountConfigurationKey,
  type AccountConfigurationKey,
} from "~/domain/configuration/model";

export const DASHBOARD_SETTINGS_TAB = {
  account: "account",
  appearance: "appearance",
  runtime: "runtime",
  security: "security",
} as const;

export const DASHBOARD_SETTINGS_QUERY_PARAM = {
  key: "setting",
  modal: "modal",
  tab: "tab",
} as const;

export const DASHBOARD_SETTINGS_MODAL = {
  editAccount: "edit-account-setting",
} as const;

export type DashboardSettingsTab =
  (typeof DASHBOARD_SETTINGS_TAB)[keyof typeof DASHBOARD_SETTINGS_TAB];

export type DashboardSettingsModal =
  (typeof DASHBOARD_SETTINGS_MODAL)[keyof typeof DASHBOARD_SETTINGS_MODAL];

export interface DashboardSettingsAccountFormViewState {
  editingKey: AccountConfigurationKey | null;
  errors?: AccountConfigurationFormState["errors"];
  isOpen: boolean;
  mode: "edit" | null;
  values: AccountConfigurationFormValues;
}

export interface DashboardSettingsSecuritySession {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  expiresAt: string;
  createdAt: string;
  isCurrent: boolean;
  user: {
    displayName: string;
    email: string;
    role: string;
  };
}

export interface DashboardSettingsGrantedLoaderData {
  access: "granted";
  accountForm: DashboardSettingsAccountFormViewState;
  accountValues: Record<AccountConfigurationKey, string>;
  selectedTab: DashboardSettingsTab;
  authorizedTabs: DashboardSettingsTab[];
  hasSettingsSecurityManageAny?: boolean;
  sessions?: DashboardSettingsSecuritySession[];
}

export interface DashboardSettingsDeniedLoaderData {
  access: "denied";
  selectedTab: DashboardSettingsTab;
}

export type DashboardSettingsLoaderData =
  | DashboardSettingsDeniedLoaderData
  | DashboardSettingsGrantedLoaderData;

interface ResolveDashboardSettingsAccountFormArgs {
  accountValues: Record<AccountConfigurationKey, string>;
  editKey: string | null;
  modal: string | null;
}

interface BuildDashboardSettingsAccountFormStateArgs {
  editingKey?: AccountConfigurationKey | null;
  errors?: AccountConfigurationFormState["errors"];
  mode: "edit" | null;
  values: AccountConfigurationFormValues;
}

export interface DashboardSettingsHrefParams {
  key?: AccountConfigurationKey | null;
  modal?: DashboardSettingsModal | null;
  tab: DashboardSettingsTab;
}

function buildDashboardSettingsAccountFormState({
  editingKey,
  errors,
  mode,
  values,
}: BuildDashboardSettingsAccountFormStateArgs): DashboardSettingsAccountFormViewState {
  return {
    editingKey: editingKey ?? null,
    errors,
    isOpen: mode !== null,
    mode,
    values,
  };
}

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
    [DASHBOARD_SETTINGS_QUERY_PARAM.tab]: tab,
  });

  return `/dashboard/settings?${searchParams.toString()}`;
}

export function buildDashboardSettingsModalHref({
  key,
  modal,
  tab,
}: DashboardSettingsHrefParams) {
  const searchParams = new URLSearchParams({
    [DASHBOARD_SETTINGS_QUERY_PARAM.tab]: tab,
  });

  if (modal) {
    searchParams.set(DASHBOARD_SETTINGS_QUERY_PARAM.modal, modal);
  }

  if (key) {
    searchParams.set(DASHBOARD_SETTINGS_QUERY_PARAM.key, key);
  }

  return `/dashboard/settings?${searchParams.toString()}`;
}

export function buildDeniedDashboardSettingsLoaderData(): DashboardSettingsDeniedLoaderData {
  return {
    access: "denied",
    selectedTab: DASHBOARD_SETTINGS_TAB.account,
  };
}

export function resolveDashboardSettingsAccountForm({
  accountValues,
  editKey,
  modal,
}: ResolveDashboardSettingsAccountFormArgs): DashboardSettingsAccountFormViewState {
  if (
    modal !== DASHBOARD_SETTINGS_MODAL.editAccount ||
    !editKey ||
    !isAccountConfigurationKey(editKey)
  ) {
    return buildDashboardSettingsAccountFormState({
      mode: null,
      values: buildAccountConfigurationFormValues(),
    });
  }

  return buildDashboardSettingsAccountFormState({
    editingKey: editKey,
    mode: "edit",
    values: buildAccountConfigurationFormValues({
      key: editKey,
      value: accountValues[editKey] ?? getDefaultAccountConfigurationRecord()[editKey],
    }),
  });
}

export function mergeDashboardSettingsAccountFormState(
  loaderForm: DashboardSettingsAccountFormViewState,
  actionData?: AccountConfigurationFormState,
) {
  if (!actionData) {
    return loaderForm;
  }

  return buildDashboardSettingsAccountFormState({
    editingKey: loaderForm.editingKey,
    errors: actionData.errors,
    mode: loaderForm.mode,
    values: actionData.values,
  });
}
