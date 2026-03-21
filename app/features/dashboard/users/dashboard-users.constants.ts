import { useT } from "~/features/i18n/i18n-react";
import type { I18nTranslator } from "~/features/i18n/i18n.shared";

export function buildDashboardUsersCopy(t: I18nTranslator) {
  return {
    actionBlockedTitle: t("dashboard.users.actionBlockedTitle"),
    createActionLabel: t("dashboard.users.createActionLabel"),
    createDescription: t("dashboard.users.createDescription"),
    createTitle: t("dashboard.users.createTitle"),
    currentRoleLabel: t("dashboard.users.currentRoleLabel"),
    editActionLabel: t("dashboard.users.editActionLabel"),
    editDescription: t("dashboard.users.editDescription"),
    editTitle: t("dashboard.users.editTitle"),
    emptyState: t("dashboard.users.emptyState"),
    inventoryEyebrow: t("dashboard.users.inventoryEyebrow"),
    registryTitle: t("dashboard.users.registryTitle"),
    restrictedDescription: t("dashboard.users.restrictedDescription"),
    restrictedTitle: t("dashboard.users.restrictedTitle"),
    selfLabel: t("dashboard.users.selfLabel"),
    tableActionsLabel: t("dashboard.users.tableActionsLabel"),
    tableIdentityLabel: t("dashboard.users.tableIdentityLabel"),
    tableMetaLabel: t("dashboard.users.tableMetaLabel"),
    tableRoleLabel: t("dashboard.users.tableRoleLabel"),
  } as const;
}

export function buildDashboardUsersFormCopy(t: I18nTranslator) {
  return {
    avatarUrl: {
      label: t("dashboard.users.form.avatarUrl.label"),
      placeholder: t("dashboard.users.form.avatarUrl.placeholder"),
    },
    bio: {
      label: t("dashboard.users.form.bio.label"),
      placeholder: t("dashboard.users.form.bio.placeholder"),
    },
    cancelLabel: t("dashboard.users.form.cancelLabel"),
    displayName: {
      label: t("dashboard.users.form.displayName.label"),
      placeholder: t("dashboard.users.form.displayName.placeholder"),
    },
    email: {
      label: t("dashboard.users.form.email.label"),
      placeholder: t("dashboard.users.form.email.placeholder"),
    },
    errors: {
      createDuplicateEmail: t("dashboard.users.form.error.createDuplicateEmail"),
      deactivateMissingUser: t("dashboard.users.form.error.deactivateMissingUser"),
      forbidden: t("dashboard.users.form.error.forbidden"),
      lastActiveAdminDeactivate: t(
        "dashboard.users.form.error.lastActiveAdminDeactivate",
      ),
      lastActiveAdminDemotion: t("dashboard.users.form.error.lastActiveAdminDemotion"),
      lastActiveAdminDelete: t("dashboard.users.form.error.lastActiveAdminDelete"),
      updateDuplicateEmail: t("dashboard.users.form.error.updateDuplicateEmail"),
      updateMissingUser: t("dashboard.users.form.error.updateMissingUser"),
    },
    password: {
      editHint: t("dashboard.users.form.password.editHint"),
      label: t("dashboard.users.form.password.label"),
      placeholder: t("dashboard.users.form.password.placeholder"),
    },
    role: {
      label: t("dashboard.users.form.role.label"),
    },
    statusLabel: t("dashboard.users.form.statusLabel"),
  } as const;
}

export function useDashboardUsersCopy() {
  const t = useT();

  return {
    copy: buildDashboardUsersCopy(t),
    formCopy: buildDashboardUsersFormCopy(t),
  };
}
