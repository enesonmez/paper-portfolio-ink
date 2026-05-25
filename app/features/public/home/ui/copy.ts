import { useT } from "~/shared/i18n/i18n-react";
import type { I18nTranslator } from "~/shared/i18n/i18n.shared";
import {
  buildPrimaryContactHref,
  buildPublicSocialLinks,
  useOptionalRootLoaderData,
} from "~/lib/site";
import type { RootLoaderData } from "~/lib/site";

export function buildPublicHomeCopy(t: I18nTranslator) {
  return {
    availability: t("public.home.availability"),
    ctaBody: t("public.home.ctaBody"),
    ctaEyebrow: t("public.home.ctaEyebrow"),
    ctaPrimary: t("public.home.ctaPrimary"),
    ctaSecondary: t("public.home.ctaSecondary"),
    ctaTitle: t("public.home.ctaTitle"),
    featuredEyebrow: t("public.home.featuredEyebrow"),
    featuredTitle: t("public.home.featuredTitle"),
    heroBadge: t("public.home.heroBadge"),
    heroBody: t("public.home.heroBody"),
    heroPrimary: t("public.home.heroPrimary"),
    heroSecondary: t("public.home.heroSecondary"),
    heroTitle: t("public.home.heroTitle"),
    resumeBody: t("public.home.resumeBody"),
    resumeCta: t("public.home.resumeCta"),
    resumeEyebrow: t("public.home.resumeEyebrow"),
    resumeMetaLabel: t("public.home.resumeMetaLabel"),
    resumeTitle: t("public.home.resumeTitle"),
    socialTitle: t("public.home.socialTitle"),
    techEyebrow: t("public.home.techEyebrow"),
    techTitle: t("public.home.techTitle"),
    visualCommand: t("public.home.visualCommand"),
    visualLabel: t("public.home.visualLabel"),
  } as const;
}

export function buildPublicHomeHighlights(t: I18nTranslator) {
  return [
    t("public.home.highlight.1"),
    t("public.home.highlight.2"),
    t("public.home.highlight.3"),
  ] as const;
}

export function buildPublicHomeMetrics(t: I18nTranslator) {
  return [
    {
      label: t("public.home.metric.focus.label"),
      value: t("public.home.metric.focus.value"),
    },
    {
      label: t("public.home.metric.stack.label"),
      value: t("public.home.metric.stack.value"),
    },
    {
      label: t("public.home.metric.style.label"),
      value: t("public.home.metric.style.value"),
    },
  ] as const;
}

export function buildPublicHomeFeaturedProjectsCopy(t: I18nTranslator) {
  return {
    browseAll: t("public.home.featuredProjects.browseAll"),
    featuredSince: t("public.home.featuredProjects.featuredSince"),
    liveCta: t("public.home.featuredProjects.liveCta"),
    projectsCta: t("public.home.featuredProjects.projectsCta"),
    repoCta: t("public.home.featuredProjects.repoCta"),
  } as const;
}

export function buildPublicHomeSocialCards(
  t: I18nTranslator,
  configuration?: RootLoaderData["configuration"],
) {
  const socialLinks = buildPublicSocialLinks(configuration);

  return socialLinks.map((link) => ({
    description: t(`public.home.social.${link.key}.description`),
    href: link.href,
    key: link.key,
    label: t(`public.home.social.${link.key}.label`),
  }));
}

export function buildPublicHomeResumePoints(t: I18nTranslator) {
  return [
    t("public.home.resumePoint.1"),
    t("public.home.resumePoint.2"),
    t("public.home.resumePoint.3"),
    t("public.home.resumePoint.4"),
  ] as const;
}

export function buildPublicHomeResumeMeta(t: I18nTranslator) {
  return [
    {
      label: t("public.home.resumeMeta.basedIn.label"),
      value: t("public.home.resumeMeta.basedIn.value"),
    },
    {
      label: t("public.home.resumeMeta.workingWith.label"),
      value: t("public.home.resumeMeta.workingWith.value"),
    },
    {
      label: t("public.home.resumeMeta.delivery.label"),
      value: t("public.home.resumeMeta.delivery.value"),
    },
  ] as const;
}

export function usePublicHomeCopy() {
  const t = useT();
  const rootData = useOptionalRootLoaderData();
  const configuration = rootData?.configuration;

  return {
    copy: buildPublicHomeCopy(t),
    featuredProjectsCopy: buildPublicHomeFeaturedProjectsCopy(t),
    highlights: buildPublicHomeHighlights(t),
    metrics: buildPublicHomeMetrics(t),
    primaryContactHref: buildPrimaryContactHref(configuration),
    resumeMeta: buildPublicHomeResumeMeta(t),
    resumePoints: buildPublicHomeResumePoints(t),
    socialCards: buildPublicHomeSocialCards(t, configuration),
  };
}

export const PUBLIC_HOME_SURFACE_CLASSNAME =
  "border-2 border-black bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]";
