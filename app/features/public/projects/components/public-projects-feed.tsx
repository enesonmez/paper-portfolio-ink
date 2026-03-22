import { useEffect, useEffectEvent, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useFetcher } from "react-router";

import { useLocalizedPath } from "~/shared/i18n/i18n-react";
import type { PublicProjectCard as PublicProjectCardData } from "~/lib/projects/projects.server";

import {
  buildPublicProjectsFeedHref,
  mergePublicProjects,
  type PublicProjectsFeedLoaderData,
  usePublicProjectsCopy,
} from "../public-projects.shared";
import { PublicProjectCard } from "./public-project-card";

interface PublicProjectsFeedProps {
  initialNextCursor: string | null;
  initialProjects: PublicProjectCardData[];
}

export function PublicProjectsFeed({
  initialNextCursor,
  initialProjects,
}: PublicProjectsFeedProps) {
  const to = useLocalizedPath();
  const copy = usePublicProjectsCopy();
  const fetcher = useFetcher<PublicProjectsFeedLoaderData>();
  const [projects, setProjects] = useState(initialProjects);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const inFlightCursorRef = useRef<string | null>(null);

  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  useEffect(() => {
    setNextCursor(initialNextCursor);
    inFlightCursorRef.current = null;
  }, [initialNextCursor]);

  useEffect(() => {
    if (fetcher.state !== "idle") {
      return;
    }

    const requestedCursor = inFlightCursorRef.current;

    if (requestedCursor === null) {
      return;
    }

    inFlightCursorRef.current = null;

    const fetcherData = fetcher.data;

    if (!fetcherData || fetcherData.cursor !== requestedCursor) {
      return;
    }

    setProjects((current) => mergePublicProjects(current, fetcherData.projects));
    setNextCursor(fetcherData.nextCursor);
  }, [fetcher.data, fetcher.state]);

  const handleIntersection = useEffectEvent((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;

    if (!entry?.isIntersecting || fetcher.state !== "idle" || nextCursor === null) {
      return;
    }

    if (inFlightCursorRef.current !== null) {
      return;
    }

    inFlightCursorRef.current = nextCursor;
    void fetcher.load(to(buildPublicProjectsFeedHref(nextCursor)));
  });

  useEffect(() => {
    const node = sentinelRef.current;

    if (!node || nextCursor === null) {
      return;
    }

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: "280px 0px",
    });

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [nextCursor]);

  return (
    <div className="grid gap-8">
      <div className="grid gap-6 lg:grid-cols-2">
        {projects.map((project) => (
          <PublicProjectCard key={project.slug} project={project} />
        ))}
      </div>

      {nextCursor !== null ? (
        <div
          ref={sentinelRef}
          aria-live="polite"
          className="bg-background grid place-items-center gap-3 border-2 border-dashed border-black px-4 py-6 text-center"
        >
          {fetcher.state === "loading" ? (
            <div className="inline-flex items-center gap-2 text-sm font-bold uppercase">
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              {copy.feedLoading}
            </div>
          ) : (
            <p className="text-sm font-bold uppercase">{copy.feedReady}</p>
          )}
          <p className="text-muted-foreground text-xs tracking-[0.18em] uppercase">
            {copy.scrollHint}
          </p>
        </div>
      ) : null}
    </div>
  );
}
