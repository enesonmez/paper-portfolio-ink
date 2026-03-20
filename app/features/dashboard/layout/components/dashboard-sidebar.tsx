import { Form, NavLink } from "react-router";
import { X } from "lucide-react";

import {
  DASHBOARD_LAYOUT_COPY,
  DASHBOARD_LAYOUT_ICON,
  getDashboardNavigation,
} from "../dashboard-layout.constants";
import type { DashboardIdentity } from "../dashboard-layout.shared";
import { Button } from "~/components/ui/button";

interface DashboardSidebarProps {
  isSidebarOpen: boolean;
  onClose: () => void;
  user: DashboardIdentity;
}

export function DashboardSidebar({
  isSidebarOpen,
  onClose,
  user,
}: DashboardSidebarProps) {
  const LogoutIcon = DASHBOARD_LAYOUT_ICON.logout;
  const navigation = getDashboardNavigation(user.role);

  return (
    <aside
      className={[
        "bg-muted fixed inset-y-0 left-0 z-30 flex w-72 max-w-[88vw] shrink-0 flex-col border-r-2 border-black transition-transform duration-200 md:relative md:inset-auto md:z-auto md:min-h-screen md:translate-x-0 dark:bg-stone-900",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
      ].join(" ")}
    >
      <div className="border-b-2 border-black p-5 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-primary flex size-11 items-center justify-center border-2 border-black text-lg font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]">
              &gt;_
            </div>
            <div>
              <p className="font-display text-foreground text-3xl leading-none uppercase">
                {DASHBOARD_LAYOUT_COPY.shellTitle}
              </p>
              <p className="text-muted-foreground font-sans text-[11px] font-bold tracking-[0.18em] uppercase">
                {DASHBOARD_LAYOUT_COPY.shellVersion}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label={DASHBOARD_LAYOUT_COPY.closeMenuAriaLabel}
            className="bg-card text-foreground flex size-10 items-center justify-center border-2 border-black md:hidden dark:bg-stone-800"
            onClick={onClose}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <nav
        className="flex flex-1 flex-col gap-2 p-4"
        aria-label={DASHBOARD_LAYOUT_COPY.navigationAriaLabel}
      >
        {navigation.map((item) => {
          const ItemIcon = item.icon;

          if (item.kind === "link") {
            return (
              <NavLink
                key={item.label}
                to={item.to}
                end
                onClick={onClose}
                className={({ isActive }) =>
                  [
                    "flex items-center justify-between gap-3 border-2 border-black px-4 py-3 font-sans text-sm font-bold tracking-[0.12em] uppercase transition-transform",
                    isActive
                      ? "bg-primary text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]"
                      : "bg-card text-foreground hover:translate-x-0.5 hover:translate-y-0.5 dark:bg-stone-800",
                  ].join(" ")
                }
              >
                <span className="flex items-center gap-3">
                  <ItemIcon className="size-4" />
                  <span>{item.label}</span>
                </span>
                <span className="text-xs">{item.statusLabel}</span>
              </NavLink>
            );
          }

          return (
            <div
              key={item.label}
              className="bg-card text-foreground flex items-center justify-between gap-3 border-2 border-black px-4 py-3 font-sans text-sm font-bold tracking-[0.12em] uppercase dark:bg-stone-800"
              aria-disabled="true"
            >
              <span className="flex items-center gap-3">
                <ItemIcon className="size-4" />
                <span>{item.label}</span>
              </span>
              <span className="text-muted-foreground text-[10px]">{item.note}</span>
            </div>
          );
        })}
      </nav>

      <div className="border-t-2 border-black p-4">
        <Form action="/logout" method="post">
          <Button
            type="submit"
            variant="destructive"
            className="flex w-full cursor-pointer items-center justify-between px-4 py-3 tracking-[0.12em] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
            aria-label={DASHBOARD_LAYOUT_COPY.logoutAriaLabel}
          >
            <span className="flex items-center gap-3">
              <LogoutIcon className="size-4" aria-hidden="true" />
              <span>{DASHBOARD_LAYOUT_COPY.logoutLabel}</span>
            </span>
          </Button>
        </Form>
      </div>
    </aside>
  );
}
