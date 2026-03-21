import { Link } from "react-router";
import { ArrowLeft, Clock3 } from "lucide-react";

import { Button } from "~/components/ui/button";
import { useLocalizedPath } from "~/features/i18n/i18n-react";
import type { PublicPostDetail, PublicPostListItem } from "~/lib/posts/posts.server";
import { usePublicBlogCopy } from "./public-blog.shared";
import { PublicBlogPostBody } from "./components/public-blog-post-body";

interface PublicBlogPostScreenProps {
  morePosts: PublicPostListItem[];
  post: PublicPostDetail;
}

export function PublicBlogPostScreen({ morePosts, post }: PublicBlogPostScreenProps) {
  const to = useLocalizedPath();
  const { copy } = usePublicBlogCopy();

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:px-8 md:py-16 lg:px-12 lg:py-20">
      <Button asChild variant="secondary" className="w-fit">
        <Link to={to("/blog")}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          {copy.backToBlog}
        </Link>
      </Button>

      <section className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_20rem] xl:items-start">
        <div className="grid gap-8">
          <header className="bg-card grid gap-5 border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:p-8 dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]">
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
            <h1 className="font-display text-6xl leading-[0.92] uppercase md:text-7xl">
              {post.title}
            </h1>
            <p className="text-muted-foreground max-w-3xl text-base leading-8 md:text-lg">
              {post.excerpt}
            </p>
            <p className="text-muted-foreground text-xs font-bold tracking-[0.16em] uppercase">
              {copy.updatedLabel}: {post.updatedAtLabel}
            </p>
          </header>

          {post.coverImageUrl ? (
            <div className="bg-card overflow-hidden border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]">
              <img
                src={post.coverImageUrl}
                alt=""
                className="h-72 w-full object-cover md:h-104"
              />
            </div>
          ) : null}

          <article>
            <PublicBlogPostBody content={post.content} />
          </article>
        </div>

        <aside className="grid gap-6">
          <section className="bg-card grid gap-4 border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]">
            <h2 className="font-sans text-lg font-black uppercase">
              {post.authorName}
            </h2>
            <p className="text-muted-foreground text-sm leading-7">
              {post.authorBio ?? copy.authorFallbackBio}
            </p>
          </section>

          {morePosts.length > 0 ? (
            <section className="bg-card grid gap-4 border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]">
              <h2 className="font-sans text-lg font-black uppercase">
                {copy.moreNotesTitle}
              </h2>
              <div className="grid gap-4">
                {morePosts.map((morePost) => (
                  <div
                    key={morePost.slug}
                    className="grid gap-1 border-b-2 border-black/10 pb-4 last:border-b-0 last:pb-0"
                  >
                    <p className="text-muted-foreground text-xs font-bold tracking-[0.16em] uppercase">
                      {morePost.publishedAtLabel}
                    </p>
                    <Link
                      to={to(`/blog/${morePost.slug}`)}
                      className="focus-visible:ring-destructive focus-visible:ring-offset-background font-sans text-base leading-tight font-black underline-offset-4 hover:underline focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                      {morePost.title}
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </aside>
      </section>
    </main>
  );
}
