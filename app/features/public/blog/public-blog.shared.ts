import type { PublicPostListItem } from "~/lib/posts/posts.server";
import { z } from "zod";

export const PUBLIC_BLOG_COPY = {
  archiveCaption:
    "Published notes, postmortems, and deployment logs from the same paper desk.",
  archiveEyebrow: "Public Logbook",
  archiveTitle: "Field Notes From The Edge",
  authorLabel: "By",
  backToBlog: "Back To Blog",
  emptyBody:
    "Public notes are being edited right now. The editorial pipeline is ready, but no published story is available yet.",
  emptyTitle: "Notebook still drying",
  feedLoading: "Loading next set...",
  feedReady: "Scroll to load more notes",
  moreNotesTitle: "More Notes",
  notebookIndexTitle: "Notebook Index",
  recentTopicsTitle: "Recent Topics",
  readTimeSuffix: "min read",
  scrollHint: "Automatic loading continues as you scroll down.",
  updatedLabel: "Updated",
} as const;

export const PUBLIC_BLOG_PAGE_SIZE = 5;

export const PUBLIC_BLOG_QUERY_PARAM = {
  cursor: "cursor",
} as const;

export const PUBLIC_BLOG_TOPICS = [
  "Cloudflare",
  "React Router",
  "D1",
  "Editorial UX",
  "Observability",
  "Deploy Notes",
] as const;

export interface PublicBlogLoaderData {
  nextCursor: string | null;
  posts: PublicPostListItem[];
}

export interface PublicBlogFeedLoaderData {
  cursor: string | null;
  nextCursor: string | null;
  posts: PublicPostListItem[];
}

const publicBlogCursorSchema = z.object({
  createdAtIso: z.string().datetime(),
  publishedAtIso: z.string().datetime(),
  slug: z.string().min(1),
  updatedAtIso: z.string().datetime(),
});

export type PublicBlogCursor = z.infer<typeof publicBlogCursorSchema>;

export function parsePublicBlogCursor(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    const result = publicBlogCursorSchema.safeParse(parsed);

    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function buildPublicBlogFeedHref(cursor: string) {
  return `/blog/feed?${new URLSearchParams({
    [PUBLIC_BLOG_QUERY_PARAM.cursor]: cursor,
  }).toString()}`;
}

export function mergePublicBlogPosts(
  existing: PublicPostListItem[],
  incoming: PublicPostListItem[],
) {
  const seen = new Set(existing.map((post) => post.slug));
  const merged = [...existing];

  for (const post of incoming) {
    if (seen.has(post.slug)) {
      continue;
    }

    seen.add(post.slug);
    merged.push(post);
  }

  return merged;
}
