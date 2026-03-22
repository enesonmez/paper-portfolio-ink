import {
  FolderKanban,
  Languages,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Settings,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import type { AppLocale, I18nTranslator } from "~/shared/i18n/i18n.shared";
import { buildLocalizedPath } from "~/shared/i18n/i18n.shared";

export interface DashboardNavigationLinkItem {
  icon: LucideIcon;
  kind: "link";
  label: string;
  statusLabel: string;
  to: string;
}

export interface DashboardNavigationStaticItem {
  icon: LucideIcon;
  kind: "static";
  label: string;
  note: string;
}

export type DashboardNavigationItem =
  | DashboardNavigationLinkItem
  | DashboardNavigationStaticItem;

export function getDashboardNavigation(
  locale: AppLocale,
  role: string,
  t: I18nTranslator,
): DashboardNavigationItem[] {
  const baseNavigation: readonly DashboardNavigationItem[] = [
    {
      icon: LayoutDashboard,
      kind: "link",
      label: t("dashboard.layout.navDashboard"),
      statusLabel: t("dashboard.layout.navStatusLive"),
      to: buildLocalizedPath(locale, "/dashboard"),
    },
    {
      icon: Newspaper,
      kind: "link",
      label: t("dashboard.layout.navPosts"),
      statusLabel: t("dashboard.layout.navStatusLive"),
      to: buildLocalizedPath(locale, "/dashboard/posts"),
    },
    {
      icon: FolderKanban,
      kind: "link",
      label: t("dashboard.layout.navProjects"),
      statusLabel: t("dashboard.layout.navStatusLive"),
      to: buildLocalizedPath(locale, "/dashboard/projects"),
    },
  ];
  const adminNavigation: readonly DashboardNavigationItem[] = [
    {
      icon: Languages,
      kind: "link",
      label: t("dashboard.layout.navResources"),
      statusLabel: t("dashboard.layout.navStatusLive"),
      to: buildLocalizedPath(locale, "/dashboard/resources"),
    },
    {
      icon: Wrench,
      kind: "link",
      label: t("dashboard.layout.navSkills"),
      statusLabel: t("dashboard.layout.navStatusLive"),
      to: buildLocalizedPath(locale, "/dashboard/skills"),
    },
    {
      icon: Users,
      kind: "link",
      label: t("dashboard.layout.navUsers"),
      statusLabel: t("dashboard.layout.navStatusLive"),
      to: buildLocalizedPath(locale, "/dashboard/users"),
    },
  ];
  const staticNavigation: readonly DashboardNavigationItem[] = [
    {
      icon: Settings,
      kind: "static",
      label: t("dashboard.layout.navSettings"),
      note: t("dashboard.layout.navStatusLater"),
    },
  ];

  return [
    ...baseNavigation,
    ...(role === "admin" ? adminNavigation : []),
    ...staticNavigation,
  ];
}

export const DASHBOARD_LAYOUT_ICON = {
  logout: LogOut,
} as const;
