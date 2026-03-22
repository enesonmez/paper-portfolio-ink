import { Boxes, FileUser, Menu, X } from "lucide-react";
import { NavLink } from "react-router";

import { LocaleSwitcher } from "~/shared/i18n/components/locale-switcher";
import { cn } from "~/lib/utils";

import { usePublicLayoutCopy, type PublicTheme } from "../public-layout.shared";
import { PublicThemeToggle } from "./public-theme-toggle";

interface PublicSiteHeaderProps {
  theme: PublicTheme;
}

function renderNavItem(
  item: ReturnType<typeof usePublicLayoutCopy>["navItems"][number],
  navResume: string,
  homePath: string,
) {
  return (
    <NavLink
      key={item.to}
      end={item.to === homePath}
      to={item.to}
      className={({ isActive }) =>
        cn(
          "hover:decoration-primary px-2 py-1 decoration-4 underline-offset-4 hover:underline",
          isActive ? "decoration-primary underline" : "",
        )
      }
    >
      {item.label === navResume ? (
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
  const { copy, navItems } = usePublicLayoutCopy();
  const homePath = navItems[0].to;

  return (
    <header className="bg-background/90 sticky top-0 z-50 border-b-2 border-black backdrop-blur-sm">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 md:px-8 lg:px-12">
        <NavLink to={navItems[0].to} className="flex min-w-0 items-center gap-3">
          <span className="bg-primary flex size-11 items-center justify-center border-2 border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Boxes className="size-5" aria-hidden="true" />
          </span>
          <span className="font-display truncate text-[2rem] leading-none tracking-tight uppercase sm:text-4xl">
            {copy.footerName}
          </span>
        </NavLink>

        <div className="flex shrink-0 items-center gap-2 md:gap-4">
          <nav
            className="hidden flex-wrap items-center justify-end gap-2 text-[14px] font-bold uppercase md:flex md:gap-5"
            aria-label={copy.navPrimaryAriaLabel}
          >
            {navItems.map((item) => renderNavItem(item, copy.navResume, homePath))}
          </nav>

          <LocaleSwitcher className="hidden md:flex" />
          <PublicThemeToggle theme={theme} />

          <details className="group relative md:hidden">
            <summary
              aria-label={copy.navMenuLabel}
              className="bg-card inline-flex min-h-10 cursor-pointer list-none items-center gap-2 border-2 border-black px-2 py-2 text-[11px] font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5 dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)] [&::-webkit-details-marker]:hidden"
            >
              <Menu className="size-4 group-open:hidden" aria-hidden="true" />
              <X className="hidden size-4 group-open:block" aria-hidden="true" />
              <span className="hidden min-[420px]:inline">{copy.navMenuText}</span>
            </summary>

            <nav
              aria-label={copy.navMobileAriaLabel}
              className="bg-card absolute top-[calc(100%+0.75rem)] right-0 z-20 grid w-[min(18rem,calc(100vw-2rem))] gap-2 border-2 border-black p-3 text-[13px] font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]"
            >
              <div className="bg-background border-2 border-black px-2 py-2">
                <LocaleSwitcher className="justify-end" />
              </div>
              {navItems.map((item) => (
                <div
                  key={item.to}
                  className="bg-background border-2 border-black px-1 py-1"
                >
                  {renderNavItem(item, copy.navResume, homePath)}
                </div>
              ))}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
