import { useT } from "~/shared/i18n/i18n-react";
import type { I18nTranslator } from "~/shared/i18n/i18n.shared";

export function buildDashboardPostsCopy(t: I18nTranslator) {
  return {
    createActionLabel: t("dashboard.posts.createActionLabel"),
    createDescription: t("dashboard.posts.createDescription"),
    composeEyebrow: t("dashboard.posts.composeEyebrow"),
    createTitle: t("dashboard.posts.createTitle"),
    editActionLabel: t("dashboard.posts.editActionLabel"),
    editDescription: t("dashboard.posts.editDescription"),
    editTitle: t("dashboard.posts.editTitle"),
    emptyState: t("dashboard.posts.emptyState"),
    inventoryEyebrow: t("dashboard.posts.inventoryEyebrow"),
    publishedLabel: t("dashboard.posts.publishedLabel"),
    registryTitle: t("dashboard.posts.registryTitle"),
    tableActionsLabel: t("dashboard.posts.tableActionsLabel"),
    tableNameLabel: t("dashboard.posts.tableNameLabel"),
    tableStatusLabel: t("dashboard.posts.tableStatusLabel"),
    tableSummaryLabel: t("dashboard.posts.tableSummaryLabel"),
  } as const;
}

export function buildDashboardPostsFormCopy(t: I18nTranslator) {
  return {
    backToListLabel: t("dashboard.posts.form.backToListLabel"),
    closeFullscreenLabel: t("dashboard.posts.form.closeFullscreenLabel"),
    content: {
      label: t("dashboard.posts.form.content.label"),
      placeholder: t("dashboard.posts.form.content.placeholder"),
    },
    coverImageUrl: {
      label: t("dashboard.posts.form.coverImageUrl.label"),
      placeholder: t("dashboard.posts.form.coverImageUrl.placeholder"),
    },
    errors: {
      deleteMissingPost: t("dashboard.posts.form.error.deleteMissingPost"),
      missingAuthor: t("dashboard.posts.form.error.missingAuthor"),
      updateMissingPost: t("dashboard.posts.form.error.updateMissingPost"),
    },
    editor: {
      imagePromptLabel: t("dashboard.posts.form.editor.imagePromptLabel"),
      linkPromptLabel: t("dashboard.posts.form.editor.linkPromptLabel"),
      loadingLabel: t("dashboard.posts.form.editor.loadingLabel"),
      toolbar: {
        blockquote: t("dashboard.posts.form.editor.toolbar.blockquote"),
        bold: t("dashboard.posts.form.editor.toolbar.bold"),
        bulletList: t("dashboard.posts.form.editor.toolbar.bulletList"),
        codeBlock: t("dashboard.posts.form.editor.toolbar.codeBlock"),
        heading1: t("dashboard.posts.form.editor.toolbar.heading1"),
        heading2: t("dashboard.posts.form.editor.toolbar.heading2"),
        heading3: t("dashboard.posts.form.editor.toolbar.heading3"),
        horizontalRule: t("dashboard.posts.form.editor.toolbar.horizontalRule"),
        image: t("dashboard.posts.form.editor.toolbar.image"),
        italic: t("dashboard.posts.form.editor.toolbar.italic"),
        orderedList: t("dashboard.posts.form.editor.toolbar.orderedList"),
        redo: t("dashboard.posts.form.editor.toolbar.redo"),
        setLink: t("dashboard.posts.form.editor.toolbar.setLink"),
        undo: t("dashboard.posts.form.editor.toolbar.undo"),
        underline: t("dashboard.posts.form.editor.toolbar.underline"),
        unsetLink: t("dashboard.posts.form.editor.toolbar.unsetLink"),
      },
      urlDefaultValue: t("dashboard.posts.form.editor.urlDefaultValue"),
    },
    excerpt: {
      label: t("dashboard.posts.form.excerpt.label"),
      placeholder: t("dashboard.posts.form.excerpt.placeholder"),
    },
    fullscreenTitlePlaceholder: t("dashboard.posts.form.fullscreenTitlePlaceholder"),
    heroHelper: t("dashboard.posts.form.heroHelper"),
    publishedAt: {
      label: t("dashboard.posts.form.publishedAt.label"),
    },
    slug: {
      label: t("dashboard.posts.form.slug.label"),
      placeholder: t("dashboard.posts.form.slug.placeholder"),
    },
    status: {
      label: t("dashboard.posts.form.status.label"),
    },
    title: {
      label: t("dashboard.posts.form.title.label"),
      placeholder: t("dashboard.posts.form.title.placeholder"),
    },
  } as const;
}

export function useDashboardPostsCopy() {
  const t = useT();

  return {
    copy: buildDashboardPostsCopy(t),
    formCopy: buildDashboardPostsFormCopy(t),
  };
}
