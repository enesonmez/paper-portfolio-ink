import { useT } from "~/shared/i18n/i18n-react";

export function useDashboardOverviewCopy() {
  const t = useT();

  return {
    columns: {
      actions: t("dashboard.overview.tableActionsLabel"),
      category: t("dashboard.overview.tableCategoryLabel"),
      status: t("dashboard.overview.tableStatusLabel"),
      title: t("dashboard.overview.tableTitleLabel"),
    },
    copy: {
      contentPipelineEyebrow: t("dashboard.overview.contentPipelineEyebrow"),
      contentPipelineTitle: t("dashboard.overview.contentPipelineTitle"),
      createPostActionLabel: t("dashboard.overview.createPostActionLabel"),
      logBadge: t("dashboard.overview.logBadge"),
      runtimeFeedEyebrow: t("dashboard.overview.runtimeFeedEyebrow"),
      runtimeFeedTitle: t("dashboard.overview.runtimeFeedTitle"),
    },
  };
}
