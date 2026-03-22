import { useT } from "~/shared/i18n/i18n-react";
import type { I18nTranslator } from "~/shared/i18n/i18n.shared";

export function buildDashboardLayoutCopy(t: I18nTranslator) {
  return {
    closeMenuAriaLabel: t("dashboard.layout.closeMenuAriaLabel"),
    closeOverlayAriaLabel: t("dashboard.layout.closeOverlayAriaLabel"),
    logoutAriaLabel: t("dashboard.layout.logoutAriaLabel"),
    logoutLabel: t("dashboard.layout.logoutLabel"),
    menuOpenAriaLabel: t("dashboard.layout.menuOpenAriaLabel"),
    navigationAriaLabel: t("dashboard.layout.navigationAriaLabel"),
    roleAccessSuffix: t("dashboard.layout.roleAccessSuffix"),
    shellTitle: t("dashboard.layout.shellTitle"),
    shellVersion: t("dashboard.layout.shellVersion"),
    statusDescription: t("dashboard.layout.statusDescription"),
    statusTitle: t("dashboard.layout.statusTitle"),
  } as const;
}

export function useDashboardLayoutCopy() {
  const t = useT();

  return buildDashboardLayoutCopy(t);
}
