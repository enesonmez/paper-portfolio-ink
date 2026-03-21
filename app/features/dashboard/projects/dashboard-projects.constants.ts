import { useT } from "~/features/i18n/i18n-react";
import type { I18nTranslator } from "~/features/i18n/i18n.shared";

export function buildDashboardProjectsCopy(t: I18nTranslator) {
  return {
    createActionLabel: t("dashboard.projects.createActionLabel"),
    createDescription: t("dashboard.projects.createDescription"),
    createTitle: t("dashboard.projects.createTitle"),
    editActionLabel: t("dashboard.projects.editActionLabel"),
    editDescription: t("dashboard.projects.editDescription"),
    editTitle: t("dashboard.projects.editTitle"),
    emptyState: t("dashboard.projects.emptyState"),
    featuredLabel: t("dashboard.projects.featuredLabel"),
    featuredToggleLabel: t("dashboard.projects.featuredToggleLabel"),
    inventoryEyebrow: t("dashboard.projects.inventoryEyebrow"),
    registryTitle: t("dashboard.projects.registryTitle"),
    tableActionsLabel: t("dashboard.projects.tableActionsLabel"),
    tableLiveFlag: t("dashboard.projects.tableLiveFlag"),
    tableNameLabel: t("dashboard.projects.tableNameLabel"),
    tableRepositoryFlag: t("dashboard.projects.tableRepositoryFlag"),
    tableSortPrefix: t("dashboard.projects.tableSortPrefix"),
    tableStatusLabel: t("dashboard.projects.tableStatusLabel"),
    tableSummaryLabel: t("dashboard.projects.tableSummaryLabel"),
  } as const;
}

export function buildDashboardProjectsFormCopy(t: I18nTranslator) {
  return {
    cancelLabel: t("dashboard.projects.form.cancelLabel"),
    coverImageUrl: {
      label: t("dashboard.projects.form.coverImageUrl.label"),
      placeholder: t("dashboard.projects.form.coverImageUrl.placeholder"),
    },
    description: {
      label: t("dashboard.projects.form.description.label"),
    },
    errors: {
      deleteMissingProject: t("dashboard.projects.form.error.deleteMissingProject"),
      updateMissingProject: t("dashboard.projects.form.error.updateMissingProject"),
    },
    liveUrl: {
      label: t("dashboard.projects.form.liveUrl.label"),
      placeholder: t("dashboard.projects.form.liveUrl.placeholder"),
    },
    repositoryUrl: {
      label: t("dashboard.projects.form.repositoryUrl.label"),
      placeholder: t("dashboard.projects.form.repositoryUrl.placeholder"),
    },
    slug: {
      label: t("dashboard.projects.form.slug.label"),
      placeholder: t("dashboard.projects.form.slug.placeholder"),
    },
    sortOrder: {
      label: t("dashboard.projects.form.sortOrder.label"),
      placeholder: t("dashboard.projects.form.sortOrder.placeholder"),
    },
    status: {
      label: t("dashboard.projects.form.status.label"),
    },
    summary: {
      label: t("dashboard.projects.form.summary.label"),
      placeholder: t("dashboard.projects.form.summary.placeholder"),
    },
    title: {
      label: t("dashboard.projects.form.title.label"),
      placeholder: t("dashboard.projects.form.title.placeholder"),
    },
  } as const;
}

export function useDashboardProjectsCopy() {
  const t = useT();

  return {
    copy: buildDashboardProjectsCopy(t),
    formCopy: buildDashboardProjectsFormCopy(t),
  };
}
