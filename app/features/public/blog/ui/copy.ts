import { useT } from "~/shared/i18n/i18n-react";
import type { I18nTranslator } from "~/shared/i18n/i18n.shared";

export function buildPublicBlogCopy(t: I18nTranslator) {
  return {
    archiveCaption: t("public.blog.archiveCaption"),
    archiveEyebrow: t("public.blog.archiveEyebrow"),
    archiveTitle: t("public.blog.archiveTitle"),
    authorFallbackBio: t("public.blog.authorFallbackBio"),
    authorLabel: t("public.blog.authorLabel"),
    backToBlog: t("public.blog.backToBlog"),
    emptyBody: t("public.blog.emptyBody"),
    emptyTitle: t("public.blog.emptyTitle"),
    feedLoading: t("public.blog.feedLoading"),
    feedReady: t("public.blog.feedReady"),
    moreNotesTitle: t("public.blog.moreNotesTitle"),
    notebookIndexTitle: t("public.blog.notebookIndexTitle"),
    recentTopicsTitle: t("public.blog.recentTopicsTitle"),
    readTimeSuffix: t("public.blog.readTimeSuffix"),
    scrollHint: t("public.blog.scrollHint"),
    updatedLabel: t("public.blog.updatedLabel"),
  } as const;
}

export function buildPublicBlogTopics(t: I18nTranslator) {
  return [
    t("public.blog.topic.1"),
    t("public.blog.topic.2"),
    t("public.blog.topic.3"),
    t("public.blog.topic.4"),
    t("public.blog.topic.5"),
    t("public.blog.topic.6"),
  ] as const;
}

export function usePublicBlogCopy() {
  const t = useT();

  return {
    copy: buildPublicBlogCopy(t),
    topics: buildPublicBlogTopics(t),
  };
}
