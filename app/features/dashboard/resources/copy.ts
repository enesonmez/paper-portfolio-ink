import { useT } from "~/shared/i18n/i18n-react";
import type { I18nTranslator } from "~/shared/i18n/i18n.shared";

export function buildDashboardResourcesCopy(t: I18nTranslator) {
  return {
    actionBlockedTitle: t("dashboard.resources.actionBlockedTitle"),
    cacheDescription: t("dashboard.resources.cacheDescription"),
    cacheEyebrow: t("dashboard.resources.cacheEyebrow"),
    clearSearchLabel: t("dashboard.resources.clearSearchLabel"),
    createLocaleActionLabel: t("dashboard.resources.createLocaleActionLabel"),
    createLocaleDescription: t("dashboard.resources.createLocaleDescription"),
    createLocaleTitle: t("dashboard.resources.createLocaleTitle"),
    createTranslationActionLabel: t("dashboard.resources.createTranslationActionLabel"),
    createTranslationDescription: t("dashboard.resources.createTranslationDescription"),
    createTranslationTitle: t("dashboard.resources.createTranslationTitle"),
    currentRoleLabel: t("dashboard.resources.currentRoleLabel"),
    editLocaleActionLabel: t("dashboard.resources.editLocaleActionLabel"),
    editLocaleDescription: t("dashboard.resources.editLocaleDescription"),
    editLocaleTitle: t("dashboard.resources.editLocaleTitle"),
    editTranslationActionLabel: t("dashboard.resources.editTranslationActionLabel"),
    editTranslationDescription: t("dashboard.resources.editTranslationDescription"),
    editTranslationTitle: t("dashboard.resources.editTranslationTitle"),
    localeFilterTitle: t("dashboard.resources.localeFilterTitle"),
    localeInventoryEyebrow: t("dashboard.resources.localeInventoryEyebrow"),
    localeTabLabel: t("dashboard.resources.localeTabLabel"),
    metricActiveLocales: t("dashboard.resources.metricActiveLocales"),
    metricSelectedLocaleTranslations: t(
      "dashboard.resources.metricSelectedLocaleTranslations",
    ),
    metricTotalLocales: t("dashboard.resources.metricTotalLocales"),
    metricTotalTranslations: t("dashboard.resources.metricTotalTranslations"),
    paginationNextLabel: t("dashboard.resources.paginationNextLabel"),
    paginationPreviousLabel: t("dashboard.resources.paginationPreviousLabel"),
    registryTitle: t("dashboard.resources.registryTitle"),
    restrictedDescription: t("dashboard.resources.restrictedDescription"),
    restrictedTitle: t("dashboard.resources.restrictedTitle"),
    searchEmptyState: t("dashboard.resources.searchEmptyState"),
    searchTitle: t("dashboard.resources.searchTitle"),
    tabDescription: t("dashboard.resources.tabDescription"),
    translationInventoryEyebrow: t("dashboard.resources.translationInventoryEyebrow"),
    translationTabLabel: t("dashboard.resources.translationTabLabel"),
  } as const;
}

export function buildDashboardResourcesFormCopy(t: I18nTranslator) {
  return {
    cancelLabel: t("dashboard.resources.form.cancelLabel"),
    errors: {
      createLocaleDuplicateCode: t(
        "dashboard.resources.form.error.createLocaleDuplicateCode",
      ),
      createTranslationDuplicateKey: t(
        "dashboard.resources.form.error.createTranslationDuplicateKey",
      ),
      deleteLocaleMissing: t("dashboard.resources.form.error.deleteLocaleMissing"),
      deleteLocaleRestricted: t(
        "dashboard.resources.form.error.deleteLocaleRestricted",
      ),
      deleteTranslationMissing: t(
        "dashboard.resources.form.error.deleteTranslationMissing",
      ),
      forbidden: t("dashboard.resources.form.error.forbidden"),
      localeMissing: t("dashboard.resources.form.error.localeMissing"),
      translationLocaleMissing: t(
        "dashboard.resources.form.error.translationLocaleMissing",
      ),
      translationMissing: t("dashboard.resources.form.error.translationMissing"),
      updateLocaleDuplicateCode: t(
        "dashboard.resources.form.error.updateLocaleDuplicateCode",
      ),
      updateLocaleMissing: t("dashboard.resources.form.error.updateLocaleMissing"),
      updateTranslationDuplicateKey: t(
        "dashboard.resources.form.error.updateTranslationDuplicateKey",
      ),
      updateTranslationMissing: t(
        "dashboard.resources.form.error.updateTranslationMissing",
      ),
    },
    locale: {
      activeLabel: t("dashboard.resources.form.locale.activeLabel"),
      activeOptions: {
        false: t("common.inactive"),
        true: t("common.active"),
      },
      code: {
        label: t("dashboard.resources.form.locale.code.label"),
        placeholder: t("dashboard.resources.form.locale.code.placeholder"),
      },
      defaultLabel: t("dashboard.resources.form.locale.defaultLabel"),
      defaultOptions: {
        false: t("dashboard.resources.form.locale.defaultNo"),
        true: t("dashboard.resources.form.locale.defaultYes"),
      },
      label: {
        label: t("dashboard.resources.form.locale.label.label"),
        placeholder: t("dashboard.resources.form.locale.label.placeholder"),
      },
      sortOrder: {
        label: t("dashboard.resources.form.locale.sortOrder.label"),
        placeholder: t("dashboard.resources.form.locale.sortOrder.placeholder"),
      },
    },
    translation: {
      key: {
        label: t("dashboard.resources.form.translation.key.label"),
        placeholder: t("dashboard.resources.form.translation.key.placeholder"),
      },
      locale: {
        label: t("dashboard.resources.form.translation.locale.label"),
      },
      search: {
        label: t("dashboard.resources.form.translation.search.label"),
        placeholder: t("dashboard.resources.form.translation.search.placeholder"),
      },
      value: {
        label: t("dashboard.resources.form.translation.value.label"),
        placeholder: t("dashboard.resources.form.translation.value.placeholder"),
      },
    },
  } as const;
}

export function useDashboardResourcesCopy() {
  const t = useT();

  return {
    copy: buildDashboardResourcesCopy(t),
    formCopy: buildDashboardResourcesFormCopy(t),
  };
}
