import { useEffect, useEffectEvent, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useFetcher } from "react-router";

import type { PublicProjectCard as PublicProjectCardData } from "~/lib/projects/projects.server";

import {
  buildPublicProjectsFeedHref,
  mergePublicProjects,
  PUBLIC_PROJECTS_COPY,
  type PublicProjectsFeedLoaderData,
} from "../public-projects.shared";
import { PublicProjectCard } from "./public-project-card";

interface PublicProjectsFeedProps {
  initialNextPage: number | null;
  initialProjects: PublicProjectCardData[];
}

export function PublicProjectsFeed({
  initialNextPage,
  initialProjects,
}: PublicProjectsFeedProps) {
  const fetcher = useFetcher<PublicProjectsFeedLoaderData>();
  const [projects, setProjects] = useState(initialProjects);
  const [nextPage, setNextPage] = useState<number | null>(initialNextPage);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const inFlightPageRef = useRef<number | null>(null);

  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  useEffect(() => {
    setNextPage(initialNextPage);
    inFlightPageRef.current = null;
  }, [initialNextPage]);

  useEffect(() => {
    if (fetcher.state !== "idle") {
      return;
    }

    const requestedPage = inFlightPageRef.current;

    if (requestedPage === null) {
      return;
    }

    inFlightPageRef.current = null;

    const fetcherData = fetcher.data;

    if (!fetcherData || fetcherData.page !== requestedPage) {
      return;
    }

    setProjects((current) => mergePublicProjects(current, fetcherData.projects));
    setNextPage(fetcherData.nextPage);
  }, [fetcher.data, fetcher.state]);

  const handleIntersection = useEffectEvent((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;

    if (!entry?.isIntersecting || fetcher.state !== "idle" || nextPage === null) {
      return;
    }

    if (inFlightPageRef.current !== null) {
      return;
    }

    inFlightPageRef.current = nextPage;
    void fetcher.load(buildPublicProjectsFeedHref(nextPage));
  });

  useEffect(() => {
    const node = sentinelRef.current;

    if (!node || nextPage === null) {
      return;
    }

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: "280px 0px",
    });

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [nextPage]);

  return (
    <div className="grid gap-8">
      <div className="grid gap-6 lg:grid-cols-2">
        {projects.map((project) => (
          <PublicProjectCard key={project.slug} project={project} />
        ))}
      </div>

      {nextPage !== null ? (
        <div
          ref={sentinelRef}
          aria-live="polite"
          className="bg-background grid place-items-center gap-3 border-2 border-dashed border-black px-4 py-6 text-center"
        >
          {fetcher.state === "loading" ? (
            <div className="inline-flex items-center gap-2 text-sm font-bold uppercase">
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              {PUBLIC_PROJECTS_COPY.feedLoading}
            </div>
          ) : (
            <p className="text-sm font-bold uppercase">
              {PUBLIC_PROJECTS_COPY.feedReady}
            </p>
          )}
          <p className="text-muted-foreground text-xs tracking-[0.18em] uppercase">
            {PUBLIC_PROJECTS_COPY.scrollHint}
          </p>
        </div>
      ) : null}
    </div>
  );
}
