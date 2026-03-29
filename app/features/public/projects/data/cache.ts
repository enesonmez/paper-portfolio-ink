import { z } from "zod";

export const PUBLIC_PROJECTS_CACHE_OPTIONS = {
  maxAgeSeconds: 15 * 60,
  staleWhileRevalidateSeconds: 24 * 60 * 60,
} as const;

export const publicProjectsDataSchema = z.object({
  nextCursor: z.string().nullable(),
  projects: z.array(
    z.object({
      coverImageUrl: z.string().nullable(),
      createdAtLabel: z.string(),
      description: z.string().nullable(),
      isFeatured: z.boolean(),
      liveUrl: z.string().nullable(),
      repositoryUrl: z.string().nullable(),
      slug: z.string(),
      summary: z.string(),
      title: z.string(),
    }),
  ),
  stats: z.object({
    featuredCount: z.number(),
    liveCount: z.number(),
    totalCount: z.number(),
  }),
});

export function buildPublicProjectsCacheKey(request: Request) {
  return new URL("/__cache/public/projects/page-1", request.url).toString();
}
