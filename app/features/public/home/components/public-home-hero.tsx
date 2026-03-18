import { ArrowRight, Boxes, Sparkles } from "lucide-react";
import { Link } from "react-router";

import { Button } from "~/components/ui/button";

import {
  PUBLIC_HOME_COPY,
  PUBLIC_HOME_HIGHLIGHTS,
  PUBLIC_HOME_METRICS,
  PUBLIC_HOME_SURFACE_CLASSNAME,
} from "../public-home.shared";

export function PublicHomeHero() {
  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:px-8 md:py-20 lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)] lg:px-12 lg:py-28">
      <div className="order-2 grid content-start gap-8 lg:order-1">
        <div className="grid gap-5">
          <span className="w-fit border-2 border-black bg-primary px-3 py-1 text-xs font-bold uppercase">
            {PUBLIC_HOME_COPY.heroBadge}
          </span>

          <h1 className="font-display text-6xl leading-[0.92] uppercase sm:text-7xl md:text-[5.75rem]">
            {PUBLIC_HOME_COPY.heroTitle}
          </h1>

          <p className="text-muted-foreground max-w-2xl border-l-4 border-black pl-5 text-base leading-8 md:text-lg">
            {PUBLIC_HOME_COPY.heroBody}
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <Button asChild size="lg">
            <Link to="/projects">
              {PUBLIC_HOME_COPY.heroPrimary}
              <ArrowRight className="size-5" aria-hidden="true" />
            </Link>
          </Button>

          <Button asChild size="lg" variant="secondary">
            <Link to="/#resume">{PUBLIC_HOME_COPY.heroSecondary}</Link>
          </Button>
        </div>

        <ul className="grid gap-3 text-sm font-bold uppercase md:grid-cols-3">
          {PUBLIC_HOME_HIGHLIGHTS.map((item) => (
            <li
              key={item}
              className={`${PUBLIC_HOME_SURFACE_CLASSNAME} flex min-h-20 items-center px-4 py-3`}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="order-1 hidden lg:block">
        <div
          className={`${PUBLIC_HOME_SURFACE_CLASSNAME} relative aspect-square overflow-hidden bg-primary`}
        >
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,0,0,0.14)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.14)_50%,rgba(0,0,0,0.14)_75%,transparent_75%,transparent)] bg-size-[28px_28px]" />

          <div className="relative z-10 grid h-full gap-6 p-5 md:p-8">
            <div className="flex items-start justify-between">
              <div className="grid gap-2">
                <span className="w-fit border-2 border-black bg-card px-3 py-1 text-[11px] font-bold uppercase">
                  {PUBLIC_HOME_COPY.visualLabel}
                </span>
                <span className="text-sm font-bold uppercase">
                  {PUBLIC_HOME_COPY.availability}
                </span>
              </div>
              <span className="flex size-14 items-center justify-center border-2 border-black bg-card">
                <Boxes className="size-7" aria-hidden="true" />
              </span>
            </div>

            <div className="mt-auto grid gap-4">
              <div className="grid gap-3 border-2 border-black bg-card p-4">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase">
                  <span>System</span>
                  <span>Ready</span>
                </div>
                <div className="grid gap-3">
                  {PUBLIC_HOME_METRICS.map((metric) => (
                    <div
                      key={metric.label}
                      className="flex items-center justify-between border-b-2 border-black pb-2 text-xs font-bold uppercase last:border-b-0 last:pb-0"
                    >
                      <span>{metric.label}</span>
                      <span>{metric.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-2 border-black bg-black p-4 text-primary">
                <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase">
                  <Sparkles className="size-4" aria-hidden="true" />
                  Runtime command
                </div>
                <code className="font-sans text-sm md:text-base">
                  {PUBLIC_HOME_COPY.visualCommand}
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
