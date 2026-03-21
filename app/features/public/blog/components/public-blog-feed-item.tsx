import { Link } from "react-router";
import { ArrowUpRight, Clock3 } from "lucide-react";

import { useLocalizedPath, useT } from "~/features/i18n/i18n-react";
import type { PublicPostListItem } from "~/lib/posts/posts.server";
import { usePublicBlogCopy } from "../public-blog.shared";

interface PublicBlogFeedItemProps {
  post: PublicPostListItem;
  variant?: "lead" | "list";
}

export function PublicBlogFeedItem({
  post,
  variant = "list",
}: PublicBlogFeedItemProps) {
  const t = useT();
  const to = useLocalizedPath();
  const { copy } = usePublicBlogCopy();
  const isLead = variant === "lead";

  return (
    <article className="grid gap-5 border-b-2 border-black/10 pb-8 last:border-b-0 last:pb-0 md:grid-cols-[minmax(0,1fr)_13rem] md:items-start">
      <div className="grid gap-4">
        <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs font-bold tracking-[0.16em] uppercase">
          <span>{copy.authorLabel}</span>
          <span className="text-foreground">{post.authorName}</span>
          <span aria-hidden="true">/</span>
          <time dateTime={post.publishedAtIso}>{post.publishedAtLabel}</time>
          <span aria-hidden="true">/</span>
          <span className="inline-flex items-center gap-2">
            <Clock3 className="size-3.5" aria-hidden="true" />
            {post.readingTimeMinutes} {copy.readTimeSuffix}
          </span>
        </div>

        <div className="grid gap-3">
          <Link
            to={to(`/blog/${post.slug}`)}
            className="group focus-visible:ring-destructive focus-visible:ring-offset-background inline-flex items-start gap-2 focus-visible:ring-4 focus-visible:ring-offset-4 focus-visible:outline-none"
          >
            <h2
              className={
                isLead
                  ? "font-sans text-3xl leading-tight font-black md:text-5xl"
                  : "font-sans text-2xl leading-tight font-black md:text-4xl"
              }
            >
              {post.title}
            </h2>
            <ArrowUpRight
              className="mt-1 size-5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </Link>
          <p
            className={
              isLead
                ? "text-muted-foreground max-w-3xl text-base leading-8 md:text-lg"
                : "text-muted-foreground max-w-2xl text-sm leading-7 md:text-base"
            }
          >
            {post.excerpt}
          </p>
        </div>
      </div>

      <Link
        to={to(`/blog/${post.slug}`)}
        aria-label={`${post.title} ${t("aria.publicBlog.cover")}`}
        className="group focus-visible:ring-destructive focus-visible:ring-offset-background block focus-visible:ring-4 focus-visible:ring-offset-4 focus-visible:outline-none"
      >
        <div className="bg-muted overflow-hidden border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]">
          {post.coverImageUrl ? (
            <img
              src={post.coverImageUrl}
              alt=""
              className={
                isLead ? "h-48 w-full object-cover" : "h-36 w-full object-cover"
              }
              loading="lazy"
            />
          ) : (
            <div className="bg-primary font-display text-primary-foreground grid h-36 place-items-center px-4 text-center text-4xl leading-none uppercase md:h-48">
              {post.title}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
