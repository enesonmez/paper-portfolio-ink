import { useT } from "~/shared/i18n/i18n-react";
import type { I18nTranslator } from "~/shared/i18n/i18n.shared";

export function buildLoginMeta(t: I18nTranslator) {
  return [
    { title: t("site.title.login") },
    {
      name: "description",
      content: t("site.description.login"),
    },
  ] as const;
}

export function buildLoginCopy(t: I18nTranslator) {
  return {
    adminBadge: t("login.adminBadge"),
    buildLabel: t("login.buildLabel"),
    buttonIdle: t("login.buttonIdle"),
    buttonSubmitting: t("login.buttonSubmitting"),
    emailLabel: t("login.emailLabel"),
    emailPlaceholder: t("login.emailPlaceholder"),
    footerSecurity: t("login.footerSecurity"),
    heading: t("login.heading"),
    headingHighlight: t("login.headingHighlight"),
    headingTail: t("login.headingTail"),
    nodeLabel: t("login.nodeLabel"),
    passwordLabel: t("login.passwordLabel"),
    returnToSite: t("login.returnToSite"),
    securityDescription: t("login.securityDescription"),
    securityLevel: t("login.securityLevel"),
    siteName: t("login.siteName"),
  } as const;
}

export function useLoginCopy() {
  const t = useT();

  return buildLoginCopy(t);
}
