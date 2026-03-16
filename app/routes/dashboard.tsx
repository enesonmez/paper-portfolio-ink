import { useState } from "react";
import {
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  Settings,
  X,
} from "lucide-react";
import { NavLink, Outlet, useLoaderData } from "react-router";

import type { Route } from "./+types/dashboard";
import { buildLoginRedirect } from "../lib/auth/login.server";
import { requireSession } from "../lib/auth/session.server";

interface DashboardIdentity {
  displayName: string;
  email: string;
  initials: string;
  role: string;
}

const dashboardNavigation = [
  {
    kind: "link" as const,
    label: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    kind: "static" as const,
    label: "Posts",
    note: "Phase 4.5",
    icon: Newspaper,
  },
  {
    kind: "link" as const,
    label: "Projects",
    to: "/dashboard/projects",
    icon: FolderKanban,
  },
  {
    kind: "static" as const,
    label: "Settings",
    note: "Later",
    icon: Settings,
  },
];

function readString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function buildInitials(source: string) {
  const letters = source
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return letters || "PE";
}

function toDashboardIdentity(
  session: Exclude<Awaited<ReturnType<typeof requireSession>>, Response>,
) {
  const user = session.user as Record<string, unknown>;
  const displayName =
    readString(user.name) ??
    readString(user.displayName) ??
    readString(user.email) ??
    "Paper Enes Ink";
  const email = readString(user.email) ?? "-";
  const role = readString(user.role) ?? "-";

  return {
    displayName,
    email,
    initials: buildInitials(displayName),
    role,
  } satisfies DashboardIdentity;
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const session = await requireSession(request, context, {
    redirectTo: buildLoginRedirect(request),
  });

  if (session instanceof Response) {
    return session;
  }

  return {
    user: toDashboardIdentity(session),
  };
}

export default function DashboardLayout() {
  const { user } = useLoaderData<typeof loader>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="bg-background flex min-h-screen overflow-x-hidden">
      {isSidebarOpen ? (
        <button
          type="button"
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      ) : null}

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
                  Admin Portal
                </p>
                <p className="text-muted-foreground font-sans text-[11px] font-bold tracking-[0.18em] uppercase">
                  V1.0.4-stable
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close navigation menu"
              className="bg-card text-foreground flex size-10 items-center justify-center border-2 border-black md:hidden dark:bg-stone-800"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-2 p-4" aria-label="Dashboard">
          {dashboardNavigation.map((item) => {
            const ItemIcon = item.icon;

            if (item.kind === "link") {
              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end
                  onClick={() => setIsSidebarOpen(false)}
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
                  <span className="text-xs">Live</span>
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
          <button
            type="button"
            disabled
            aria-label="Logout (Available in Phase 4.7)"
            className="bg-destructive text-destructive-foreground flex w-full items-center justify-between gap-3 border-2 border-black px-4 py-3 font-sans text-sm font-bold tracking-[0.12em] uppercase opacity-75"
          >
            <span className="flex items-center gap-3">
              <LogOut className="size-4" aria-hidden="true" />
              <span>Logout</span>
            </span>
            <span className="text-[10px]">Phase 4.7</span>
          </button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="bg-card sticky top-0 z-10 border-b-2 border-black px-4 py-4 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                aria-label="Open navigation menu"
                aria-expanded={isSidebarOpen}
                className="bg-primary flex size-11 items-center justify-center border-2 border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:hidden dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]"
                onClick={() => setIsSidebarOpen((current) => !current)}
              >
                <Menu className="size-5" aria-hidden="true" />
              </button>
              <span className="h-3.5 w-3.5 animate-pulse border-2 border-black bg-green-500" />
              <div>
                <p className="font-display text-foreground text-3xl leading-none uppercase md:text-4xl">
                  System Status: Logged In
                </p>
                <p className="text-muted-foreground mt-1 font-sans text-[11px] font-bold tracking-[0.18em] uppercase">
                  Session secured / dashboard shell active
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

        <div className="min-w-0 flex-1 p-4 md:p-8">
          <Outlet context={{ user }} />
        </div>
      </main>
    </div>
  );
}
