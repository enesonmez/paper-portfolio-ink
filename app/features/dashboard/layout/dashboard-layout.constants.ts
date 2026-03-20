import {
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

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

const DASHBOARD_BASE_NAVIGATION: readonly DashboardNavigationItem[] = [
  {
    icon: LayoutDashboard,
    kind: "link",
    label: "Dashboard",
    statusLabel: "Live",
    to: "/dashboard",
  },
  {
    icon: Newspaper,
    kind: "link",
    label: "Posts",
    statusLabel: "Live",
    to: "/dashboard/posts",
  },
  {
    icon: FolderKanban,
    kind: "link",
    label: "Projects",
    statusLabel: "Live",
    to: "/dashboard/projects",
  },
];

const DASHBOARD_ADMIN_NAVIGATION: readonly DashboardNavigationItem[] = [
  {
    icon: Users,
    kind: "link",
    label: "Users",
    statusLabel: "Live",
    to: "/dashboard/users",
  },
];

const DASHBOARD_STATIC_NAVIGATION: readonly DashboardNavigationItem[] = [
  {
    icon: Settings,
    kind: "static",
    label: "Settings",
    note: "Later",
  },
];

export function getDashboardNavigation(role: string): DashboardNavigationItem[] {
  return [
    ...DASHBOARD_BASE_NAVIGATION,
    ...(role === "admin" ? DASHBOARD_ADMIN_NAVIGATION : []),
    ...DASHBOARD_STATIC_NAVIGATION,
  ];
}

export const DASHBOARD_LAYOUT_COPY = {
  closeMenuAriaLabel: "Close navigation menu",
  closeOverlayAriaLabel: "Close navigation overlay",
  logoutAriaLabel: "Logout current admin session",
  logoutLabel: "Logout",
  menuOpenAriaLabel: "Open navigation menu",
  navigationAriaLabel: "Dashboard",
  shellTitle: "Admin Portal",
  shellVersion: "V1.0.4-stable",
  statusDescription: "Session secured / dashboard shell active",
  statusTitle: "System Status: Logged In",
} as const;

export const DASHBOARD_LAYOUT_ICON = {
  logout: LogOut,
} as const;
