import type { ReactNode } from "react";

import type { PublicTheme } from "./theme";
import { PublicSiteFooter } from "./components/public-site-footer";
import { PublicSiteHeader } from "./components/public-site-header";

interface PublicSiteLayoutProps {
  children: ReactNode;
  theme: PublicTheme;
}

export function PublicSiteLayout({ children, theme }: PublicSiteLayoutProps) {
  return (
    <div id="top" className="relative flex min-h-screen flex-col overflow-x-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-112 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.25),transparent_40%),linear-gradient(180deg,rgba(250,204,21,0.12),transparent_55%)]"
      />
      <PublicSiteHeader theme={theme} />
      <div className="relative flex-1">{children}</div>
      <PublicSiteFooter />
    </div>
  );
}
