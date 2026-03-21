import { z } from "zod";

export const PUBLIC_BLOG_CACHE_OPTIONS = {
  maxAgeSeconds: 15 * 60,
  staleWhileRevalidateSeconds: 24 * 60 * 60,
} as const;

export const publicBlogDataSchema = z.object({
  nextCursor: z.string().nullable(),
  posts: z.array(
    z.object({
      authorName: z.string(),
      coverImageUrl: z.string().nullable(),
      excerpt: z.string(),
      publishedAtIso: z.string(),
      publishedAtLabel: z.string(),
      readingTimeMinutes: z.number(),
      slug: z.string(),
      title: z.string(),
    }),
  ),
});

export function buildPublicBlogCacheKey(request: Request) {
  return new URL("/__cache/public/blog/page-1", request.url).toString();
}
