import { ArrowUpRight, FileUser, Github, Linkedin, Mail } from "lucide-react";

import { Button } from "~/components/ui/button";
import { useT } from "~/features/i18n/i18n-react";

import {
  PUBLIC_HOME_SURFACE_CLASSNAME,
  usePublicHomeCopy,
} from "../public-home.shared";

const SOCIAL_CARD_ICONS = {
  github: Github,
  linkedin: Linkedin,
  mail: Mail,
} as const;

export function PublicHomeResume() {
  const t = useT();
  const { copy, resumeMeta, resumePoints, socialCards } = usePublicHomeCopy();

  return (
    <section
      id="resume"
      className="mx-auto grid max-w-7xl gap-8 px-4 py-14 md:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)] lg:px-12 lg:py-20"
    >
      <article
        className={`${PUBLIC_HOME_SURFACE_CLASSNAME} grid min-w-0 gap-6 p-5 min-[420px]:p-6 md:p-8`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="grid min-w-0 gap-3">
            <p className="text-muted-foreground text-xs font-bold tracking-[0.18em] uppercase">
              {copy.resumeEyebrow}
            </p>
            <h2 className="font-display text-[2.5rem] leading-[0.92] uppercase min-[420px]:text-5xl md:text-6xl">
              {copy.resumeTitle}
            </h2>
          </div>
          <span className="bg-primary flex size-14 shrink-0 items-center justify-center border-2 border-black text-black min-[420px]:size-16">
            <FileUser className="size-8" aria-hidden="true" />
          </span>
        </div>

        <p className="text-muted-foreground max-w-2xl text-sm leading-7 min-[420px]:text-base min-[420px]:leading-8">
          {copy.resumeBody}
        </p>

        <div className="grid gap-3 md:grid-cols-2">
          {resumePoints.map((item) => (
            <div
              key={item}
              className="bg-background border-2 border-black px-4 py-3 text-sm font-bold wrap-break-word uppercase"
            >
              {item}
            </div>
          ))}
        </div>

        <div className="grid gap-3 border-t-2 border-black pt-5 md:grid-cols-3">
          {resumeMeta.map((item) => (
            <div key={item.label} className="grid min-w-0 gap-2">
              <span className="text-muted-foreground text-[11px] font-bold tracking-[0.18em] uppercase">
                {item.label}
              </span>
              <span className="text-sm leading-6 font-bold wrap-break-word uppercase">
                {item.value}
              </span>
            </div>
          ))}
        </div>

        <div className="grid gap-4 border-t-2 border-black pt-5">
          <Button
            asChild
            size="lg"
            className="w-full text-center leading-5 whitespace-normal sm:w-auto"
          >
            <a href="mailto:hello@paper-portfolio-ink.dev" className="w-full">
              {copy.resumeCta}
              <ArrowUpRight className="size-5" aria-hidden="true" />
            </a>
          </Button>
          <span className="text-sm font-bold wrap-break-word uppercase">
            {copy.resumeMetaLabel}: {t("public.home.resumeFocusValue")}
          </span>
        </div>
      </article>

      <aside className="grid min-w-0 gap-6">
        <div
          className={`${PUBLIC_HOME_SURFACE_CLASSNAME} grid min-w-0 gap-5 p-5 min-[420px]:p-6 md:p-8`}
        >
          <h3 className="text-2xl font-bold uppercase min-[420px]:text-3xl">
            {copy.socialTitle}
          </h3>
          <div className="grid gap-4">
            {socialCards.map((card) => {
              const Icon = SOCIAL_CARD_ICONS[card.key];

              return (
                <a
                  key={card.href}
                  href={card.href}
                  target={card.href.startsWith("http") ? "_blank" : undefined}
                  rel={card.href.startsWith("http") ? "noreferrer" : undefined}
                  className="bg-background grid gap-2 border-2 border-black p-4 transition-transform hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex min-w-0 items-center gap-3 text-sm font-bold uppercase">
                      <Icon className="size-5" aria-hidden="true" />
                      <span className="truncate">{card.label}</span>
                    </span>
                    <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
                  </div>
                  <p className="text-muted-foreground text-sm leading-7">
                    {card.description}
                  </p>
                </a>
              );
            })}
          </div>
        </div>

        <div className="bg-primary border-2 border-black p-5 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-[420px]:p-6">
          <p className="mb-3 text-xs font-bold tracking-[0.18em] uppercase">
            {t("public.home.availabilityLabel")}
          </p>
          <p className="text-xl leading-tight font-bold wrap-break-word uppercase min-[420px]:text-2xl">
            {copy.availability}
          </p>
        </div>
      </aside>
    </section>
  );
}
