import {
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Settings,
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

export const DASHBOARD_NAVIGATION: readonly DashboardNavigationItem[] = [
  {
    icon: LayoutDashboard,
    kind: "link",
    label: "Dashboard",
    statusLabel: "Live",
    to: "/dashboard",
  },
  {
    icon: Newspaper,
    kind: "static",
    label: "Posts",
    note: "Phase 4.5",
  },
  {
    icon: FolderKanban,
    kind: "link",
    label: "Projects",
    statusLabel: "Live",
    to: "/dashboard/projects",
  },
  {
    icon: Settings,
    kind: "static",
    label: "Settings",
    note: "Later",
  },
];

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
