import { useT } from "~/shared/i18n/i18n-react";

export function useDashboardLoggingCopy() {
  const t = useT();

  return {
    copy: {
      deleteAction: t("dashboard.logging.deleteAction"),
      deleteDescription: t("dashboard.logging.deleteDescription"),
      deleteTitle: t("dashboard.logging.deleteTitle"),
      emptyErrors: t("dashboard.logging.emptyErrors"),
      emptyHistory: t("dashboard.logging.emptyHistory"),
      exportAction: t("dashboard.logging.exportAction"),
      exportDescription: t("dashboard.logging.exportDescription"),
      exportTitle: t("dashboard.logging.exportTitle"),
      filterEndLabel: t("dashboard.logging.filterEndLabel"),
      filterStartLabel: t("dashboard.logging.filterStartLabel"),
      historyTab: t("dashboard.logging.historyTab"),
      metricsErrors: t("dashboard.logging.metricsErrors"),
      metricsHistory: t("dashboard.logging.metricsHistory"),
      pageEyebrow: t("dashboard.logging.pageEyebrow"),
      pageTitle: t("dashboard.logging.pageTitle"),
      currentRoleLabel: t("dashboard.authz.currentRoleLabel"),
      rangeFormTitle: t("dashboard.logging.rangeFormTitle"),
      restrictedDescription: t("dashboard.authz.restrictedDescription"),
      restrictedTitle: t("dashboard.authz.restrictedTitle"),
      systemTab: t("dashboard.logging.systemTab"),
    },
    labels: {
      action: t("dashboard.logging.table.action"),
      code: t("dashboard.logging.table.code"),
      createdAt: t("dashboard.logging.table.createdAt"),
      message: t("dashboard.logging.table.message"),
      path: t("dashboard.logging.table.path"),
      requestId: t("dashboard.logging.table.requestId"),
      result: t("dashboard.logging.table.result"),
      severity: t("dashboard.logging.table.severity"),
      user: t("dashboard.logging.table.user"),
    },
  };
}
