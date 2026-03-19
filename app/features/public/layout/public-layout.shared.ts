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

export const PUBLIC_LAYOUT_COPY = {
  footerCaption:
    "Edge-first notlar, piksel sertliginde arayuzler ve gerektiginden fazla kahve.",
  footerCta: "Back To Top",
  footerEyebrow: "Paper / Ink / Code",
  footerName: "Enes Ink",
  footerYear: "© 2026",
  navBlog: "Blog",
  navHome: "Home",
  navMenuLabel: "Toggle navigation",
  navMenuText: "Menu",
  navProjects: "Projects",
  navResume: "Resume",
  themeDarkLabel: "Comic Noir",
  themeLightLabel: "Paper Comic",
  themeToggle: "Theme",
  themeToggleAction: "/theme",
} as const;

export const PUBLIC_NAV_ITEMS = [
  {
    label: PUBLIC_LAYOUT_COPY.navHome,
    to: "/",
  },
  {
    label: PUBLIC_LAYOUT_COPY.navProjects,
    to: "/projects",
  },
  {
    label: PUBLIC_LAYOUT_COPY.navBlog,
    to: "/blog",
  },
  {
    label: PUBLIC_LAYOUT_COPY.navResume,
    to: "/#resume",
  },
] as const;

export const PUBLIC_SOCIAL_LINKS = [
  {
    href: "https://github.com/enesonmez",
    label: "GitHub",
  },
  {
    href: "https://www.linkedin.com/in/enesonmez/",
    label: "LinkedIn",
  },
  {
    href: "mailto:hello@paper-portfolio-ink.dev",
    label: "Mail",
  },
] as const;

export function normalizePublicTheme(value: string | null | undefined): PublicTheme {
  return value === PUBLIC_THEME.dark ? PUBLIC_THEME.dark : PUBLIC_THEME.light;
}

export function isPublicPathname(pathname: string) {
  return (
    pathname === "/" ||
    pathname.startsWith("/projects") ||
    pathname.startsWith("/blog")
  );
}
