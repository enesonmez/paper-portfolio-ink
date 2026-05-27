import { buildDashboardAuthorizationCopy } from "~/shared/authz/copy";
import { useT } from "~/shared/i18n/i18n-react";
import type { I18nTranslator } from "~/shared/i18n/i18n.shared";

export function buildDashboardAnalyticsCopy(t: I18nTranslator) {
  const authzCopy = buildDashboardAuthorizationCopy(t);

  return {
    actionBlockedTitle: authzCopy.actionBlockedTitle,
    currentRoleLabel: authzCopy.currentRoleLabel,
    restrictedDescription: t("dashboard.analytics.restrictedDescription"),
    restrictedTitle: t("dashboard.analytics.restrictedTitle"),
    pageTitle: t("dashboard.analytics.pageTitle"),
    pageEyebrow: t("dashboard.analytics.pageEyebrow"),
    metricTotalViews: t("dashboard.analytics.metricTotalViews"),
    metricAvgScrollRate: t("dashboard.analytics.metricAvgScrollRate"),
    metricAvgTimeSpent: t("dashboard.analytics.metricAvgTimeSpent"),
    inventoryEyebrow: t("dashboard.analytics.inventoryEyebrow"),
    registryTitle: t("dashboard.analytics.registryTitle"),
    searchLabel: t("dashboard.analytics.searchLabel"),
    searchPlaceholder: t("dashboard.analytics.searchPlaceholder"),
    searchActionLabel: t("dashboard.analytics.searchActionLabel"),
    clearFiltersLabel: t("dashboard.analytics.clearFiltersLabel"),
    emptyState: t("dashboard.analytics.emptyState"),
    tableNameLabel: t("dashboard.analytics.tableNameLabel"),
    tableViewsLabel: t("dashboard.analytics.tableViewsLabel"),
    tableScrollRateLabel: t("dashboard.analytics.tableScrollRateLabel"),
    tableTimeSpentLabel: t("dashboard.analytics.tableTimeSpentLabel"),
    tableActionsLabel: t("dashboard.analytics.tableActionsLabel"),
    chartTooltipViews: t("dashboard.analytics.chartTooltipViews"),
    dailyViewsTab: t("dashboard.analytics.dailyViewsTab"),
    monthlyViewsTab: t("dashboard.analytics.monthlyViewsTab"),
    modalTitle: t("dashboard.analytics.modalTitle"),
    modalDescription: t("dashboard.analytics.modalDescription"),
    paginationNextLabel: t("dashboard.analytics.paginationNextLabel"),
    paginationPreviousLabel: t("dashboard.analytics.paginationPreviousLabel"),
  } as const;
}

export function useDashboardAnalyticsCopy() {
  const t = useT();

  return {
    copy: buildDashboardAnalyticsCopy(t),
  };
}
