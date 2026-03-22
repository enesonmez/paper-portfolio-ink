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

import {
  AUTHORIZATION_CLAIM,
  hasAnyAuthorizationClaim,
  hasAuthorizationClaim,
  type AuthorizationClaim,
} from "~/shared/authz/model";
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
  claims: readonly AuthorizationClaim[],
  t: I18nTranslator,
): DashboardNavigationItem[] {
  const baseNavigation: DashboardNavigationItem[] = [];

  if (hasAuthorizationClaim(claims, AUTHORIZATION_CLAIM.dashboardAccess)) {
    baseNavigation.push({
      icon: LayoutDashboard,
      kind: "link",
      label: t("dashboard.layout.navDashboard"),
      statusLabel: t("dashboard.layout.navStatusLive"),
      to: buildLocalizedPath(locale, "/dashboard"),
    });
  }

  if (
    hasAnyAuthorizationClaim(claims, [
      AUTHORIZATION_CLAIM.postsReadAny,
      AUTHORIZATION_CLAIM.postsReadOwn,
      AUTHORIZATION_CLAIM.postsCreate,
      AUTHORIZATION_CLAIM.postsUpdateAny,
      AUTHORIZATION_CLAIM.postsUpdateOwn,
      AUTHORIZATION_CLAIM.postsDeleteAny,
      AUTHORIZATION_CLAIM.postsDeleteOwn,
    ])
  ) {
    baseNavigation.push({
      icon: Newspaper,
      kind: "link",
      label: t("dashboard.layout.navPosts"),
      statusLabel: t("dashboard.layout.navStatusLive"),
      to: buildLocalizedPath(locale, "/dashboard/posts"),
    });
  }

  if (hasAuthorizationClaim(claims, AUTHORIZATION_CLAIM.projectsRead)) {
    baseNavigation.push({
      icon: FolderKanban,
      kind: "link",
      label: t("dashboard.layout.navProjects"),
      statusLabel: t("dashboard.layout.navStatusLive"),
      to: buildLocalizedPath(locale, "/dashboard/projects"),
    });
  }

  const adminNavigation: DashboardNavigationItem[] = [];

  if (
    hasAnyAuthorizationClaim(claims, [
      AUTHORIZATION_CLAIM.resourcesLocalesRead,
      AUTHORIZATION_CLAIM.resourcesTranslationsRead,
    ])
  ) {
    adminNavigation.push({
      icon: Languages,
      kind: "link",
      label: t("dashboard.layout.navResources"),
      statusLabel: t("dashboard.layout.navStatusLive"),
      to: buildLocalizedPath(locale, "/dashboard/resources"),
    });
  }

  if (hasAuthorizationClaim(claims, AUTHORIZATION_CLAIM.skillsRead)) {
    adminNavigation.push({
      icon: Wrench,
      kind: "link",
      label: t("dashboard.layout.navSkills"),
      statusLabel: t("dashboard.layout.navStatusLive"),
      to: buildLocalizedPath(locale, "/dashboard/skills"),
    });
  }

  if (hasAuthorizationClaim(claims, AUTHORIZATION_CLAIM.usersRead)) {
    adminNavigation.push({
      icon: Users,
      kind: "link",
      label: t("dashboard.layout.navUsers"),
      statusLabel: t("dashboard.layout.navStatusLive"),
      to: buildLocalizedPath(locale, "/dashboard/users"),
    });
  }

  const staticNavigation: readonly DashboardNavigationItem[] = [
    {
      icon: Settings,
      kind: "static",
      label: t("dashboard.layout.navSettings"),
      note: t("dashboard.layout.navStatusLater"),
    },
  ];

  return [...baseNavigation, ...adminNavigation, ...staticNavigation];
}

export const DASHBOARD_LAYOUT_ICON = {
  logout: LogOut,
} as const;
