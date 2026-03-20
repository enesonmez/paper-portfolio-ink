import { useState } from "react";
import { Outlet, useLoaderData } from "react-router";

import { DashboardHeader } from "./components/dashboard-header";
import { DashboardSidebar } from "./components/dashboard-sidebar";
import { DASHBOARD_LAYOUT_COPY } from "./dashboard-layout.constants";
import type { DashboardLayoutLoaderData } from "./dashboard-layout.server";

export default function DashboardLayoutRoute() {
  const { user } = useLoaderData<DashboardLayoutLoaderData>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="bg-background flex min-h-screen overflow-x-hidden">
      {isSidebarOpen ? (
        <button
          type="button"
          aria-label={DASHBOARD_LAYOUT_COPY.closeOverlayAriaLabel}
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      ) : null}

      <DashboardSidebar
        isSidebarOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((current) => !current)}
          user={user}
        />

        <div className="min-w-0 flex-1 p-4 md:p-8">
          <Outlet context={{ user }} />
        </div>
      </main>
    </div>
  );
}
