import type { I18nTranslator, TranslationKey } from "~/shared/i18n/i18n.shared";

type DashboardAuthorizationCopyField =
  | "actionBlockedTitle"
  | "currentRoleLabel"
  | "forbiddenError"
  | "restrictedDescription"
  | "restrictedTitle";

const DASHBOARD_AUTHORIZATION_COPY_KEYS = {
  actionBlockedTitle: "dashboard.authz.actionBlockedTitle",
  currentRoleLabel: "dashboard.authz.currentRoleLabel",
  forbiddenError: "dashboard.authz.forbiddenError",
  restrictedDescription: "dashboard.authz.restrictedDescription",
  restrictedTitle: "dashboard.authz.restrictedTitle",
} as const satisfies Record<DashboardAuthorizationCopyField, TranslationKey>;

export type DashboardAuthorizationCopyOverrides = Partial<
  Record<DashboardAuthorizationCopyField, TranslationKey>
>;

function resolveCopyKey(
  field: DashboardAuthorizationCopyField,
  overrides?: DashboardAuthorizationCopyOverrides,
) {
  return overrides?.[field] ?? DASHBOARD_AUTHORIZATION_COPY_KEYS[field];
}

export function buildDashboardAuthorizationCopy(
  t: I18nTranslator,
  overrides?: DashboardAuthorizationCopyOverrides,
) {
  return {
    actionBlockedTitle: t(resolveCopyKey("actionBlockedTitle", overrides)),
    currentRoleLabel: t(resolveCopyKey("currentRoleLabel", overrides)),
    forbiddenError: t(resolveCopyKey("forbiddenError", overrides)),
    restrictedDescription: t(resolveCopyKey("restrictedDescription", overrides)),
    restrictedTitle: t(resolveCopyKey("restrictedTitle", overrides)),
  } as const;
}
