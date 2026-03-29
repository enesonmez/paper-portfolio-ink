import { ArrowUpRight, Globe, Github } from "lucide-react";

import { useT } from "~/shared/i18n/i18n-react";
import type { PublicProjectCard as PublicProjectCardData } from "~/lib/projects/projects.server";

import { usePublicProjectsCopy } from "../copy";

interface PublicProjectCardProps {
  project: PublicProjectCardData;
}

export function PublicProjectCard({ project }: PublicProjectCardProps) {
  const t = useT();
  const copy = usePublicProjectsCopy();

  return (
    <article className="bg-card grid gap-5 border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 md:p-6 dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]">
      {project.coverImageUrl ? (
        <div className="bg-primary relative aspect-4/3 overflow-hidden border-2 border-black">
          <img
            alt={`${project.title} ${t("aria.publicBlog.cover")}`}
            className="h-full w-full object-cover"
            loading="lazy"
            src={project.coverImageUrl}
          />
          {project.isFeatured ? (
            <span className="bg-primary absolute top-3 left-3 border-2 border-black px-2 py-1 text-[10px] font-bold text-black uppercase">
              {copy.featuredBadge}
            </span>
          ) : null}
        </div>
      ) : (
        <div className="bg-primary/55 grid min-h-52 place-items-center border-2 border-black p-6 text-center">
          <div className="grid gap-2">
            <span className="text-xs font-bold tracking-[0.18em] uppercase">
              {project.createdAtLabel}
            </span>
            <p className="font-display text-4xl leading-none uppercase">
              {project.title}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-muted-foreground text-[11px] font-bold tracking-[0.18em] uppercase">
            {project.createdAtLabel}
          </span>
          <span className="bg-background border-2 border-black px-2 py-1 text-[10px] font-bold uppercase">
            {project.slug}
          </span>
        </div>

        <div className="grid gap-3">
          <h2 className="font-display text-5xl leading-[0.92] uppercase">
            {project.title}
          </h2>
          <p className="text-muted-foreground text-sm leading-7">{project.summary}</p>
          {project.description ? (
            <p className="border-l-4 border-black pl-4 text-sm leading-7">
              {project.description}
            </p>
          ) : null}
        </div>

        <div className="grid gap-3 border-t-2 border-black pt-4 text-sm font-bold uppercase sm:flex sm:flex-wrap sm:items-center">
          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2"
            >
              <Globe className="size-4" aria-hidden="true" />
              {copy.liveCta}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          ) : null}
          {project.repositoryUrl ? (
            <a
              href={project.repositoryUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2"
            >
              <Github className="size-4" aria-hidden="true" />
              {copy.repoCta}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
