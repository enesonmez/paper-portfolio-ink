import { buildDashboardAuthorizationCopy } from "~/shared/authz/copy";
import { useT } from "~/shared/i18n/i18n-react";
import type { I18nTranslator } from "~/shared/i18n/i18n.shared";

export function buildDashboardSkillsCopy(t: I18nTranslator) {
  const authzCopy = buildDashboardAuthorizationCopy(t);

  return {
    actionBlockedTitle: authzCopy.actionBlockedTitle,
    createActionLabel: t("dashboard.skills.createActionLabel"),
    createDescription: t("dashboard.skills.createDescription"),
    createTitle: t("dashboard.skills.createTitle"),
    currentRoleLabel: authzCopy.currentRoleLabel,
    editActionLabel: t("dashboard.skills.editActionLabel"),
    editDescription: t("dashboard.skills.editDescription"),
    editTitle: t("dashboard.skills.editTitle"),
    emptyState: t("dashboard.skills.emptyState"),
    inventoryEyebrow: t("dashboard.skills.inventoryEyebrow"),
    registryTitle: t("dashboard.skills.registryTitle"),
    restrictedDescription: authzCopy.restrictedDescription,
    restrictedTitle: authzCopy.restrictedTitle,
    tableActionsLabel: t("dashboard.skills.tableActionsLabel"),
    tableCreatedLabel: t("dashboard.skills.tableCreatedLabel"),
    tableIconLabel: t("dashboard.skills.tableIconLabel"),
    tableNameLabel: t("dashboard.skills.tableNameLabel"),
    tableSortLabel: t("dashboard.skills.tableSortLabel"),
    tableSlugLabel: t("dashboard.skills.tableSlugLabel"),
    tableSummaryLabel: t("dashboard.skills.tableSummaryLabel"),
  } as const;
}

export function buildDashboardSkillsFormCopy(t: I18nTranslator) {
  const authzCopy = buildDashboardAuthorizationCopy(t);

  return {
    cancelLabel: t("dashboard.skills.form.cancelLabel"),
    errors: {
      createDuplicateSkill: t("dashboard.skills.form.error.createDuplicateSkill"),
      deleteMissingSkill: t("dashboard.skills.form.error.deleteMissingSkill"),
      forbidden: authzCopy.forbiddenError,
      updateDuplicateSkill: t("dashboard.skills.form.error.updateDuplicateSkill"),
      updateMissingSkill: t("dashboard.skills.form.error.updateMissingSkill"),
    },
    iconKey: {
      label: t("dashboard.skills.form.iconKey.label"),
    },
    name: {
      label: t("dashboard.skills.form.name.label"),
      placeholder: t("dashboard.skills.form.name.placeholder"),
    },
    sortOrder: {
      label: t("dashboard.skills.form.sortOrder.label"),
      placeholder: t("dashboard.skills.form.sortOrder.placeholder"),
    },
    summary: {
      label: t("dashboard.skills.form.summary.label"),
      placeholder: t("dashboard.skills.form.summary.placeholder"),
    },
  } as const;
}

export function useDashboardSkillsCopy() {
  const t = useT();

  return {
    copy: buildDashboardSkillsCopy(t),
    formCopy: buildDashboardSkillsFormCopy(t),
  };
}
