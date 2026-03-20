import { ArrowUpRight, Globe, Github } from "lucide-react";
import { Link } from "react-router";

import type { PublicFeaturedProject } from "~/lib/projects/projects.server";

import {
  PUBLIC_HOME_COPY,
  PUBLIC_HOME_FEATURED_PROJECTS_COPY,
  PUBLIC_HOME_SURFACE_CLASSNAME,
} from "../public-home.shared";

interface PublicHomeFeaturedProjectsProps {
  projects: PublicFeaturedProject[];
}

export function PublicHomeFeaturedProjects({
  projects,
}: PublicHomeFeaturedProjectsProps) {
  if (projects.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:px-8 md:py-16 lg:px-12">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="grid gap-3">
          <p className="text-muted-foreground text-xs font-bold tracking-[0.18em] uppercase">
            {PUBLIC_HOME_COPY.featuredEyebrow}
          </p>
          <h2 className="font-display text-5xl uppercase md:text-6xl">
            {PUBLIC_HOME_COPY.featuredTitle}
          </h2>
        </div>
        <Link
          to="/projects"
          className="decoration-primary text-sm font-bold uppercase underline decoration-4 underline-offset-4"
        >
          {PUBLIC_HOME_FEATURED_PROJECTS_COPY.browseAll}
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {projects.map((project) => (
          <article
            key={project.slug}
            className={`${PUBLIC_HOME_SURFACE_CLASSNAME} grid gap-5 p-6 transition-transform hover:-translate-y-1`}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-muted-foreground text-[11px] font-bold tracking-[0.18em] uppercase">
                {PUBLIC_HOME_FEATURED_PROJECTS_COPY.featuredSince} /{" "}
                {project.createdAtLabel}
              </p>
              <span className="bg-primary border-2 border-black px-2 py-1 text-[10px] font-bold text-black uppercase">
                {project.slug}
              </span>
            </div>
            <h3 className="text-2xl font-bold uppercase">{project.title}</h3>
            <p className="text-muted-foreground text-sm leading-7">{project.summary}</p>
            {project.description ? (
              <p className="border-t-2 border-black pt-4 text-xs leading-6 uppercase">
                {project.description}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-3">
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 text-sm font-bold uppercase"
              >
                {PUBLIC_HOME_FEATURED_PROJECTS_COPY.projectsCta}
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
              {project.liveUrl ? (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold uppercase"
                >
                  <Globe className="size-4" aria-hidden="true" />
                  {PUBLIC_HOME_FEATURED_PROJECTS_COPY.liveCta}
                </a>
              ) : null}
              {project.repositoryUrl ? (
                <a
                  href={project.repositoryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold uppercase"
                >
                  <Github className="size-4" aria-hidden="true" />
                  {PUBLIC_HOME_FEATURED_PROJECTS_COPY.repoCta}
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
