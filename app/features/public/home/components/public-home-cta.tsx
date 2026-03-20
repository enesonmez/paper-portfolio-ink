import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

import { Button } from "~/components/ui/button";

import { PUBLIC_HOME_COPY } from "../public-home.shared";

export function PublicHomeCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16 lg:px-12">
      <div className="bg-primary border-2 border-black p-8 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:p-12">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="grid gap-4">
            <p className="text-xs font-bold tracking-[0.18em] uppercase">
              {PUBLIC_HOME_COPY.ctaEyebrow}
            </p>
            <h2 className="font-display text-5xl leading-none uppercase md:text-6xl">
              {PUBLIC_HOME_COPY.ctaTitle}
            </h2>
            <p className="max-w-3xl text-base leading-8 md:text-lg">
              {PUBLIC_HOME_COPY.ctaBody}
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button
              asChild
              size="lg"
              className="bg-black whitespace-normal text-white dark:bg-black dark:text-white"
            >
              <a href="mailto:hello@paper-portfolio-ink.dev">
                {PUBLIC_HOME_COPY.ctaPrimary}
                <ArrowRight className="size-5" aria-hidden="true" />
              </a>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/blog">{PUBLIC_HOME_COPY.ctaSecondary}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
