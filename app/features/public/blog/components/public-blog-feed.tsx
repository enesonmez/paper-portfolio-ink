import { useEffect, useEffectEvent, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useFetcher } from "react-router";

import { useLocalizedPath } from "~/shared/i18n/i18n-react";
import type { PublicPostListItem } from "~/lib/posts/posts.server";
import {
  buildPublicBlogFeedHref,
  mergePublicBlogPosts,
  type PublicBlogFeedLoaderData,
} from "../feed";
import { usePublicBlogCopy } from "../copy";
import { PublicBlogFeedItem } from "./public-blog-feed-item";
import { PublicBlogSidebar } from "./public-blog-sidebar";

interface PublicBlogFeedProps {
  initialNextCursor: string | null;
  initialPosts: PublicPostListItem[];
}

export function PublicBlogFeed({
  initialNextCursor,
  initialPosts,
}: PublicBlogFeedProps) {
  const to = useLocalizedPath();
  const { copy } = usePublicBlogCopy();
  const fetcher = useFetcher<PublicBlogFeedLoaderData>();
  const [posts, setPosts] = useState(initialPosts);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const inFlightCursorRef = useRef<string | null>(null);

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

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

    setPosts((current) => mergePublicBlogPosts(current, fetcherData.posts));
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
    void fetcher.load(to(buildPublicBlogFeedHref(nextCursor)));
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

  const [leadPost, ...remainingPosts] = posts;

  return (
    <section className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_20rem] xl:items-start">
      <div className="bg-card grid gap-8 border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:p-8 dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]">
        {leadPost ? <PublicBlogFeedItem post={leadPost} variant="lead" /> : null}

        {remainingPosts.length > 0 ? (
          <div className="grid gap-8">
            {remainingPosts.map((post) => (
              <PublicBlogFeedItem key={post.slug} post={post} />
            ))}
          </div>
        ) : null}

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

      <PublicBlogSidebar posts={posts} />
    </section>
  );
}
