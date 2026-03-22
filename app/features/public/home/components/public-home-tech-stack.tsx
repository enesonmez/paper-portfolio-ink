import { getSkillIcon } from "~/features/skills/skill-icon.shared";
import { useT } from "~/shared/i18n/i18n-react";
import type { PublicSkill } from "~/lib/skills/skills.server";

import {
  PUBLIC_HOME_SURFACE_CLASSNAME,
  usePublicHomeCopy,
} from "../public-home.shared";

interface PublicHomeTechStackProps {
  skills: PublicSkill[];
}

export function PublicHomeTechStack({ skills }: PublicHomeTechStackProps) {
  const t = useT();
  const { copy } = usePublicHomeCopy();

  if (skills.length === 0) {
    return null;
  }

  return (
    <section className="bg-card border-y-2 border-black py-16 md:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 md:px-8 lg:px-12">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="grid gap-3">
            <p className="text-muted-foreground text-xs font-bold tracking-[0.18em] uppercase">
              {copy.techEyebrow}: {skills.length}
            </p>
            <h2 className="font-display text-5xl uppercase md:text-6xl">
              {copy.techTitle}
            </h2>
          </div>
          <p className="text-muted-foreground max-w-xl text-sm leading-7 md:text-right">
            {t("public.home.techDescription")}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {skills.map((skill) => {
            const Icon = getSkillIcon(skill.iconKey);

            return (
              <article
                key={`${skill.sortOrder}-${skill.name}`}
                className={`${PUBLIC_HOME_SURFACE_CLASSNAME} grid gap-5 p-6 transition-transform hover:-translate-y-1`}
              >
                <span className="bg-primary flex size-16 items-center justify-center border-2 border-black text-black">
                  <Icon className="size-8" aria-hidden="true" />
                </span>
                <div className="grid gap-3">
                  <h3 className="text-2xl font-bold uppercase">{skill.name}</h3>
                  <p className="text-muted-foreground text-sm leading-7">
                    {skill.summary}
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
