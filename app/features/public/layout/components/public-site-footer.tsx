import { ArrowUpRight, ArrowUpToLine, TerminalSquare } from "lucide-react";

import { PUBLIC_LAYOUT_COPY, PUBLIC_SOCIAL_LINKS } from "../public-layout.shared";

export function PublicSiteFooter() {
  return (
    <footer className="bg-background border-t-2 border-black">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:px-8 lg:px-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center border-2 border-black bg-black text-white">
              <TerminalSquare className="size-4" aria-hidden="true" />
            </span>
            <div className="grid gap-1">
              <span className="font-display text-3xl leading-none uppercase">
                {PUBLIC_LAYOUT_COPY.footerName}
              </span>
              <span className="text-muted-foreground text-[11px] font-bold tracking-[0.18em] uppercase">
                {PUBLIC_LAYOUT_COPY.footerEyebrow} {PUBLIC_LAYOUT_COPY.footerYear}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {PUBLIC_SOCIAL_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                className="bg-card inline-flex items-center gap-2 border-2 border-black px-3 py-2 text-[11px] font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5 dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]"
              >
                {link.label}
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t-2 border-black pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-muted-foreground max-w-3xl text-xs leading-6 uppercase">
            {PUBLIC_LAYOUT_COPY.footerCaption}
          </p>
          <a
            href="#top"
            className="bg-card inline-flex items-center gap-2 self-start border-2 border-black px-3 py-2 text-[11px] font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5 dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]"
          >
            <ArrowUpToLine className="size-4" aria-hidden="true" />
            {PUBLIC_LAYOUT_COPY.footerCta}
          </a>
        </div>
      </div>
    </footer>
  );
}
