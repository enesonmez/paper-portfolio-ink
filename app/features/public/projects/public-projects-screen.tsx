import { FolderGit2, Globe, Layers2 } from "lucide-react";

import type { PublicProjectsLoaderData } from "./public-projects.shared";
import { PUBLIC_PROJECTS_COPY } from "./public-projects.shared";
import { PublicProjectsFeed } from "./components/public-projects-feed";

interface PublicProjectsScreenProps {
  nextPage: PublicProjectsLoaderData["nextPage"];
  projects: PublicProjectsLoaderData["projects"];
  stats: PublicProjectsLoaderData["stats"];
}

const STAT_ICONS = {
  featuredCount: Layers2,
  liveCount: Globe,
  totalCount: FolderGit2,
} as const;

const STAT_LABELS = {
  featuredCount: PUBLIC_PROJECTS_COPY.statFeatured,
  liveCount: PUBLIC_PROJECTS_COPY.statLive,
  totalCount: PUBLIC_PROJECTS_COPY.statTotal,
} as const;

export function PublicProjectsScreen({
  nextPage,
  projects,
  stats,
}: PublicProjectsScreenProps) {
  return (
    <main className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:px-8 md:py-16 lg:px-12 lg:py-20">
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(17rem,0.9fr)] lg:items-end">
        <div className="grid gap-5">
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-[0.18em]">
            {PUBLIC_PROJECTS_COPY.heroEyebrow}
          </p>
          <h1 className="font-display text-6xl uppercase leading-[0.92] md:text-7xl lg:text-[5.5rem]">
            {PUBLIC_PROJECTS_COPY.heroTitle}
          </h1>
          <p className="text-muted-foreground max-w-3xl border-l-4 border-black pl-5 text-base leading-8 md:text-lg">
            {PUBLIC_PROJECTS_COPY.heroBody}
          </p>
        </div>

        <div className="grid gap-4">
          {(Object.keys(stats) as Array<keyof typeof STAT_LABELS>).map((key) => {
            const Icon = STAT_ICONS[key];

            return (
              <div
                key={key}
                className="flex items-center justify-between gap-4 border-2 border-black bg-card px-5 py-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]"
              >
                <span className="inline-flex items-center gap-3 text-sm font-bold uppercase">
                  <Icon className="size-5" aria-hidden="true" />
                  {STAT_LABELS[key]}
                </span>
                <span className="font-display text-4xl leading-none">
                  {stats[key]}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {projects.length === 0 ? (
        <section className="grid min-h-96 content-center gap-5 border-2 border-black bg-card p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)] md:p-8">
          <p className="text-muted-foreground text-sm tracking-[0.08em] uppercase">
            {PUBLIC_PROJECTS_COPY.emptyEyebrow}
          </p>
          <h2 className="font-display text-5xl leading-none md:text-7xl">
            {PUBLIC_PROJECTS_COPY.emptyTitle}
          </h2>
          <p className="text-muted-foreground max-w-2xl text-base leading-7 md:text-lg">
            {PUBLIC_PROJECTS_COPY.emptyBody}
          </p>
        </section>
      ) : (
        <PublicProjectsFeed initialNextPage={nextPage} initialProjects={projects} />
      )}
    </main>
  );
}
