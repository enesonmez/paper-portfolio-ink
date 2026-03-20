import { useEffect, useEffectEvent, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useFetcher } from "react-router";

import type { PublicPostListItem } from "~/lib/posts/posts.server";
import {
  buildPublicBlogFeedHref,
  mergePublicBlogPosts,
  PUBLIC_BLOG_COPY,
  type PublicBlogFeedLoaderData,
} from "../public-blog.shared";
import { PublicBlogFeedItem } from "./public-blog-feed-item";
import { PublicBlogSidebar } from "./public-blog-sidebar";

interface PublicBlogFeedProps {
  initialNextPage: number | null;
  initialPosts: PublicPostListItem[];
}

export function PublicBlogFeed({ initialNextPage, initialPosts }: PublicBlogFeedProps) {
  const fetcher = useFetcher<PublicBlogFeedLoaderData>();
  const [posts, setPosts] = useState(initialPosts);
  const [nextPage, setNextPage] = useState<number | null>(initialNextPage);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const inFlightPageRef = useRef<number | null>(null);

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

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

    setPosts((current) => mergePublicBlogPosts(current, fetcherData.posts));
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
    void fetcher.load(buildPublicBlogFeedHref(nextPage));
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

        {nextPage !== null ? (
          <div
            ref={sentinelRef}
            aria-live="polite"
            className="bg-background grid place-items-center gap-3 border-2 border-dashed border-black px-4 py-6 text-center"
          >
            {fetcher.state === "loading" ? (
              <div className="inline-flex items-center gap-2 text-sm font-bold uppercase">
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                {PUBLIC_BLOG_COPY.feedLoading}
              </div>
            ) : (
              <p className="text-sm font-bold uppercase">
                {PUBLIC_BLOG_COPY.feedReady}
              </p>
            )}
            <p className="text-muted-foreground text-xs tracking-[0.18em] uppercase">
              {PUBLIC_BLOG_COPY.scrollHint}
            </p>
          </div>
        ) : null}
      </div>

      <PublicBlogSidebar posts={posts} />
    </section>
  );
}
