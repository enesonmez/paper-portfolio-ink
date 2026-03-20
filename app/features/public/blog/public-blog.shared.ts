import type { PublicPostListItem } from "~/lib/posts/posts.server";

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
  page: "page",
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
  nextPage: number | null;
  posts: PublicPostListItem[];
}

export interface PublicBlogFeedLoaderData {
  nextPage: number | null;
  page: number;
  posts: PublicPostListItem[];
}

export function normalizePublicBlogPage(value: string | null) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

export function buildPublicBlogFeedHref(page: number) {
  return `/blog/feed?${PUBLIC_BLOG_QUERY_PARAM.page}=${page}`;
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
