import { Menu } from "lucide-react";

import type { DashboardIdentity } from "../dashboard-layout.shared";
import { DASHBOARD_LAYOUT_COPY } from "../dashboard-layout.constants";

interface DashboardHeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  user: DashboardIdentity;
}

export function DashboardHeader({
  isSidebarOpen,
  onToggleSidebar,
  user,
}: DashboardHeaderProps) {
  return (
    <header className="bg-card sticky top-0 z-10 border-b-2 border-black px-4 py-4 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label={DASHBOARD_LAYOUT_COPY.menuOpenAriaLabel}
            aria-expanded={isSidebarOpen}
            className="bg-primary flex size-11 items-center justify-center border-2 border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:hidden dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]"
            onClick={onToggleSidebar}
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
          <span className="h-3.5 w-3.5 animate-pulse border-2 border-black bg-green-500" />
          <div>
            <p className="font-display text-foreground text-3xl leading-none uppercase md:text-4xl">
              {DASHBOARD_LAYOUT_COPY.statusTitle}
            </p>
            <p className="text-muted-foreground mt-1 font-sans text-[11px] font-bold tracking-[0.18em] uppercase">
              {DASHBOARD_LAYOUT_COPY.statusDescription}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden text-right md:block">
            <p className="font-sans text-sm font-bold tracking-[0.14em] uppercase">
              {user.displayName}
            </p>
            <p className="text-muted-foreground font-sans text-[11px] font-bold tracking-[0.18em] uppercase">
              {user.role} access
            </p>
          </div>
          <div className="bg-primary flex size-12 items-center justify-center border-2 border-black font-sans text-sm font-bold text-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]">
            {user.initials}
          </div>
        </div>
      </div>
    </header>
  );
}
