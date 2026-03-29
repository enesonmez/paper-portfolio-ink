import { useT } from "~/shared/i18n/i18n-react";
import type { I18nTranslator } from "~/shared/i18n/i18n.shared";

export function buildPublicProjectsCopy(t: I18nTranslator) {
  return {
    emptyBody: t("public.projects.emptyBody"),
    emptyEyebrow: t("public.projects.emptyEyebrow"),
    emptyTitle: t("public.projects.emptyTitle"),
    feedLoading: t("public.projects.feedLoading"),
    feedReady: t("public.projects.feedReady"),
    featuredBadge: t("public.projects.featuredBadge"),
    heroBody: t("public.projects.heroBody"),
    heroEyebrow: t("public.projects.heroEyebrow"),
    heroTitle: t("public.projects.heroTitle"),
    liveCta: t("public.projects.liveCta"),
    repoCta: t("public.projects.repoCta"),
    scrollHint: t("public.projects.scrollHint"),
    statFeatured: t("public.projects.statFeatured"),
    statLive: t("public.projects.statLive"),
    statTotal: t("public.projects.statTotal"),
    techLabel: t("public.projects.techLabel"),
  } as const;
}

export function usePublicProjectsCopy() {
  const t = useT();

  return buildPublicProjectsCopy(t);
}
