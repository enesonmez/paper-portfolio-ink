import { useLocalizedPath, useT } from "~/features/i18n/i18n-react";
import { stripLocalePrefix } from "~/features/i18n/i18n.shared";

type ValueOf<T> = T[keyof T];

export const PUBLIC_THEME = {
  dark: "dark",
  light: "light",
} as const;

export type PublicTheme = ValueOf<typeof PUBLIC_THEME>;

export const PUBLIC_THEME_FORM_FIELD = {
  intent: "intent",
  redirectTo: "redirectTo",
  theme: "theme",
} as const;

export const PUBLIC_THEME_INTENT = {
  setTheme: "set-theme",
} as const;

export type PublicThemeIntent = ValueOf<typeof PUBLIC_THEME_INTENT>;

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

export function normalizePublicTheme(value: string | null | undefined): PublicTheme {
  return value === PUBLIC_THEME.dark ? PUBLIC_THEME.dark : PUBLIC_THEME.light;
}

export function isPublicPathname(pathname: string) {
  const normalizedPathname = stripLocalePrefix(pathname);

  return (
    normalizedPathname === "/" ||
    normalizedPathname.startsWith("/projects") ||
    normalizedPathname.startsWith("/blog")
  );
}
