import type { ReactNode } from "react";
import { Link } from "react-router";

import { useLocalizedPath } from "~/shared/i18n/i18n-react";
import type { PublicPostListItem } from "~/lib/posts/posts.server";
import { usePublicBlogCopy } from "../copy";

interface PublicBlogSidebarProps {
  posts: PublicPostListItem[];
}

function SidebarCard({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="bg-card grid gap-4 border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="font-sans text-lg font-black uppercase">{title}</h2>
      {children}
    </section>
  );
}

export function PublicBlogSidebar({ posts }: PublicBlogSidebarProps) {
  const to = useLocalizedPath();
  const { copy, topics } = usePublicBlogCopy();

  return (
    <aside className="grid gap-6">
      <SidebarCard title={copy.notebookIndexTitle}>
        <div className="grid gap-4">
          {posts.slice(0, 4).map((post) => (
            <div
              key={post.slug}
              className="grid gap-1 border-b-2 border-black/10 pb-4 last:border-b-0 last:pb-0"
            >
              <p className="text-muted-foreground text-xs font-bold tracking-[0.16em] uppercase">
                {post.publishedAtLabel}
              </p>
              <Link
                to={to(`/blog/${post.slug}`)}
                className="focus-visible:ring-destructive focus-visible:ring-offset-background font-sans text-base leading-tight font-black underline-offset-4 hover:underline focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                {post.title}
              </Link>
            </div>
          ))}
        </div>
      </SidebarCard>

      <SidebarCard title={copy.recentTopicsTitle}>
        <div className="flex flex-wrap gap-3">
          {topics.map((topic) => (
            <span
              key={topic}
              className="bg-background border-2 border-black px-3 py-2 text-xs font-bold tracking-[0.12em] uppercase"
            >
              {topic}
            </span>
          ))}
        </div>
      </SidebarCard>
    </aside>
  );
}
