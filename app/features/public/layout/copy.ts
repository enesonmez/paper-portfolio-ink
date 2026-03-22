import { useLocalizedPath, useT } from "~/shared/i18n/i18n-react";

export function usePublicLayoutCopy() {
  const t = useT();
  const to = useLocalizedPath();

  const copy = {
    footerCaption: t("public.layout.footerCaption"),
    footerCta: t("public.layout.footerCta"),
    footerEyebrow: t("public.layout.footerEyebrow"),
    footerName: t("public.layout.footerName"),
    footerYear: t("public.layout.footerYear"),
    navBlog: t("public.layout.navBlog"),
    navHome: t("public.layout.navHome"),
    navMenuLabel: t("public.layout.navMenuLabel"),
    navMenuText: t("public.layout.navMenuText"),
    navMobileAriaLabel: t("public.layout.navMobileAriaLabel"),
    navPrimaryAriaLabel: t("public.layout.navPrimaryAriaLabel"),
    navProjects: t("public.layout.navProjects"),
    navResume: t("public.layout.navResume"),
    themeDarkLabel: t("public.layout.themeDarkLabel"),
    themeLightLabel: t("public.layout.themeLightLabel"),
    themeToggle: t("public.layout.themeToggle"),
    themeToggleAction: to("/theme"),
  } as const;

  return {
    copy,
    navItems: [
      {
        label: copy.navHome,
        to: to("/"),
      },
      {
        label: copy.navProjects,
        to: to("/projects"),
      },
      {
        label: copy.navBlog,
        to: to("/blog"),
      },
      {
        label: copy.navResume,
        to: to("/#resume"),
      },
    ] as const,
  };
}

export const PUBLIC_SOCIAL_LINKS = [
  {
    href: "https://github.com/enesonmez",
    key: "github",
  },
  {
    href: "https://www.linkedin.com/in/enesonmez/",
    key: "linkedin",
  },
  {
    href: "mailto:hello@paper-portfolio-ink.dev",
    key: "mail",
  },
] as const;
