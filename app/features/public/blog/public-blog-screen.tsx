import type { PublicPostListItem } from "~/lib/posts/posts.server";
import { PUBLIC_BLOG_COPY } from "./public-blog.shared";
import { PublicBlogFeed } from "./components/public-blog-feed";

interface PublicBlogScreenProps {
  nextPage: number | null;
  posts: PublicPostListItem[];
}

export function PublicBlogScreen({ nextPage, posts }: PublicBlogScreenProps) {
  return (
    <main className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:px-8 md:py-16 lg:px-12 lg:py-20">
      <section className="grid gap-5">
        <p className="text-muted-foreground text-xs font-bold tracking-[0.18em] uppercase">
          {PUBLIC_BLOG_COPY.archiveEyebrow}
        </p>
        <h1 className="font-display text-6xl leading-[0.92] uppercase md:text-7xl lg:text-[5.5rem]">
          {PUBLIC_BLOG_COPY.archiveTitle}
        </h1>
        <p className="text-muted-foreground max-w-3xl border-l-4 border-black pl-5 text-base leading-8 md:text-lg">
          {PUBLIC_BLOG_COPY.archiveCaption}
        </p>
      </section>

      {posts.length > 0 ? (
        <PublicBlogFeed initialNextPage={nextPage} initialPosts={posts} />
      ) : (
        <section className="bg-card grid min-h-96 content-center gap-5 border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:p-8 dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]">
          <p className="text-muted-foreground text-sm tracking-[0.08em] uppercase">
            {PUBLIC_BLOG_COPY.archiveEyebrow}
          </p>
          <h2 className="font-display text-5xl leading-none md:text-7xl">
            {PUBLIC_BLOG_COPY.emptyTitle}
          </h2>
          <p className="text-muted-foreground max-w-2xl text-base leading-7 md:text-lg">
            {PUBLIC_BLOG_COPY.emptyBody}
          </p>
        </section>
      )}
    </main>
  );
}
