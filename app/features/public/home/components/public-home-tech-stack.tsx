import {
  Cloud,
  Database,
  Feather,
  Route,
  ShieldCheck,
  SquareCode,
} from "lucide-react";

import {
  PUBLIC_HOME_COPY,
  PUBLIC_HOME_SURFACE_CLASSNAME,
  PUBLIC_HOME_TECH_STACK,
} from "../public-home.shared";

const TECH_STACK_ICONS = {
  auth: ShieldCheck,
  cloudflare: Cloud,
  drizzle: Database,
  "react-router": Route,
  tailwind: Feather,
  typescript: SquareCode,
} as const;

export function PublicHomeTechStack() {
  return (
    <section className="border-y-2 border-black bg-card py-16 md:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 md:px-8 lg:px-12">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="grid gap-3">
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-[0.18em]">
              {PUBLIC_HOME_COPY.techEyebrow}: {PUBLIC_HOME_TECH_STACK.length}
            </p>
            <h2 className="font-display text-5xl uppercase md:text-6xl">
              {PUBLIC_HOME_COPY.techTitle}
            </h2>
          </div>
          <p className="text-muted-foreground max-w-xl text-sm leading-7 md:text-right">
            Core tools I reach for when the product needs sharp routing, typed
            contracts, and deployment paths that stay boring in production.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {PUBLIC_HOME_TECH_STACK.map((item) => {
            const Icon = TECH_STACK_ICONS[item.key];

            return (
              <article
                key={item.title}
                className={`${PUBLIC_HOME_SURFACE_CLASSNAME} grid gap-5 p-6 transition-transform hover:-translate-y-1`}
              >
                <span className="flex size-16 items-center justify-center border-2 border-black bg-primary text-black">
                  <Icon className="size-8" aria-hidden="true" />
                </span>
                <div className="grid gap-3">
                  <h3 className="text-2xl font-bold uppercase">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-7">
                    {item.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
