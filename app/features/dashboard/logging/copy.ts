import { useT } from "~/shared/i18n/i18n-react";

export function useDashboardLoggingCopy() {
  const t = useT();

  return {
    copy: {
      auditDeleteDescription: t("dashboard.logging.auditDeleteDescription"),
      auditDeleteTitle: t("dashboard.logging.auditDeleteTitle"),
      auditExportDescription: t("dashboard.logging.auditExportDescription"),
      auditExportTitle: t("dashboard.logging.auditExportTitle"),
      deleteAction: t("dashboard.logging.deleteAction"),
      emptyErrors: t("dashboard.logging.emptyErrors"),
      emptyHistory: t("dashboard.logging.emptyHistory"),
      errorDeleteDescription: t("dashboard.logging.errorDeleteDescription"),
      errorDeleteTitle: t("dashboard.logging.errorDeleteTitle"),
      errorExportDescription: t("dashboard.logging.errorExportDescription"),
      errorExportTitle: t("dashboard.logging.errorExportTitle"),
      exportAction: t("dashboard.logging.exportAction"),
      filterEndLabel: t("dashboard.logging.filterEndLabel"),
      filterStartLabel: t("dashboard.logging.filterStartLabel"),
      historyTab: t("dashboard.logging.historyTab"),
      metricsErrors: t("dashboard.logging.metricsErrors"),
      metricsHistory: t("dashboard.logging.metricsHistory"),
      paginationNextLabel: t("dashboard.logging.paginationNextLabel"),
      paginationPreviousLabel: t("dashboard.logging.paginationPreviousLabel"),
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
      category: t("dashboard.logging.table.category"),
      code: t("dashboard.logging.table.code"),
      createdAt: t("dashboard.logging.table.createdAt"),
      fingerprint: t("dashboard.logging.table.fingerprint"),
      locale: t("dashboard.logging.table.locale"),
      message: t("dashboard.logging.table.message"),
      method: t("dashboard.logging.table.method"),
      resource: t("dashboard.logging.table.resource"),
      path: t("dashboard.logging.table.path"),
      requestId: t("dashboard.logging.table.requestId"),
      result: t("dashboard.logging.table.result"),
      severity: t("dashboard.logging.table.severity"),
      statusCode: t("dashboard.logging.table.statusCode"),
      target: t("dashboard.logging.table.target"),
      user: t("dashboard.logging.table.user"),
    },
  };
}
