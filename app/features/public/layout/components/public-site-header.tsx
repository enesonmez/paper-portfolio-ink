import { Boxes, FileUser, Menu, X } from "lucide-react";
import { NavLink } from "react-router";

import { cn } from "~/lib/utils";

import {
  PUBLIC_LAYOUT_COPY,
  PUBLIC_NAV_ITEMS,
  type PublicTheme,
} from "../public-layout.shared";
import { PublicThemeToggle } from "./public-theme-toggle";

interface PublicSiteHeaderProps {
  theme: PublicTheme;
}

function renderNavItem(item: (typeof PUBLIC_NAV_ITEMS)[number]) {
  return (
    <NavLink
      key={item.to}
      to={item.to}
      className={({ isActive }) =>
        cn(
          "px-2 py-1 underline-offset-4 decoration-4 hover:underline hover:decoration-primary",
          isActive ? "underline decoration-primary" : "",
        )
      }
    >
      {item.label === PUBLIC_LAYOUT_COPY.navResume ? (
        <span className="inline-flex items-center gap-2">
          <FileUser className="size-4" aria-hidden="true" />
          {item.label}
        </span>
      ) : (
        item.label
      )}
    </NavLink>
  );
}

export function PublicSiteHeader({ theme }: PublicSiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-black bg-background/90 backdrop-blur-sm">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 md:px-8 lg:px-12">
        <NavLink to="/" className="flex min-w-0 items-center gap-3">
          <span className="flex size-11 items-center justify-center border-2 border-black bg-primary text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Boxes className="size-5" aria-hidden="true" />
          </span>
          <span className="truncate font-display text-[2rem] leading-none uppercase tracking-tight sm:text-4xl">
            {PUBLIC_LAYOUT_COPY.footerName}
          </span>
        </NavLink>

        <div className="flex shrink-0 items-center gap-2 md:gap-4">
          <nav
            className="hidden flex-wrap items-center justify-end gap-2 text-[14px] font-bold uppercase md:flex md:gap-5"
            aria-label="Public navigation"
          >
            {PUBLIC_NAV_ITEMS.map(renderNavItem)}
          </nav>

          <PublicThemeToggle theme={theme} />

          <details className="group relative md:hidden">
            <summary
              aria-label={PUBLIC_LAYOUT_COPY.navMenuLabel}
              className="inline-flex min-h-10 cursor-pointer list-none items-center gap-2 border-2 border-black bg-card px-2 py-2 text-[11px] font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5 [&::-webkit-details-marker]:hidden dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]"
            >
              <Menu
                className="size-4 group-open:hidden"
                aria-hidden="true"
              />
              <X
                className="hidden size-4 group-open:block"
                aria-hidden="true"
              />
              <span className="hidden min-[420px]:inline">
                {PUBLIC_LAYOUT_COPY.navMenuText}
              </span>
            </summary>

            <nav
              aria-label="Mobile public navigation"
              className="absolute right-0 top-[calc(100%+0.75rem)] z-20 grid w-[min(18rem,calc(100vw-2rem))] gap-2 border-2 border-black bg-card p-3 text-[13px] font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]"
            >
              {PUBLIC_NAV_ITEMS.map((item) => (
                <div
                  key={item.to}
                  className="border-2 border-black bg-background px-1 py-1"
                >
                  {renderNavItem(item)}
                </div>
              ))}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
