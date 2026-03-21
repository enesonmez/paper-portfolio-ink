import type { PublicPostListItem } from "~/lib/posts/posts.server";
import { z } from "zod";
import { useT } from "~/features/i18n/i18n-react";
import type { I18nTranslator } from "~/features/i18n/i18n.shared";

export function buildPublicBlogCopy(t: I18nTranslator) {
  return {
    archiveCaption: t("public.blog.archiveCaption"),
    archiveEyebrow: t("public.blog.archiveEyebrow"),
    archiveTitle: t("public.blog.archiveTitle"),
    authorFallbackBio: t("public.blog.authorFallbackBio"),
    authorLabel: t("public.blog.authorLabel"),
    backToBlog: t("public.blog.backToBlog"),
    emptyBody: t("public.blog.emptyBody"),
    emptyTitle: t("public.blog.emptyTitle"),
    feedLoading: t("public.blog.feedLoading"),
    feedReady: t("public.blog.feedReady"),
    moreNotesTitle: t("public.blog.moreNotesTitle"),
    notebookIndexTitle: t("public.blog.notebookIndexTitle"),
    recentTopicsTitle: t("public.blog.recentTopicsTitle"),
    readTimeSuffix: t("public.blog.readTimeSuffix"),
    scrollHint: t("public.blog.scrollHint"),
    updatedLabel: t("public.blog.updatedLabel"),
  } as const;
}

export const PUBLIC_BLOG_PAGE_SIZE = 5;

export const PUBLIC_BLOG_QUERY_PARAM = {
  cursor: "cursor",
} as const;

export function buildPublicBlogTopics(t: I18nTranslator) {
  return [
    t("public.blog.topic.1"),
    t("public.blog.topic.2"),
    t("public.blog.topic.3"),
    t("public.blog.topic.4"),
    t("public.blog.topic.5"),
    t("public.blog.topic.6"),
  ] as const;
}

export function usePublicBlogCopy() {
  const t = useT();

  return {
    copy: buildPublicBlogCopy(t),
    topics: buildPublicBlogTopics(t),
  };
}

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
