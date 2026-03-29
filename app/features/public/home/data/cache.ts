import { z } from "zod";

import { isSkillIconKey, type SkillIconKey } from "~/domain/skills/icons";

export const PUBLIC_HOME_CACHE_OPTIONS = {
  maxAgeSeconds: 15 * 60,
  staleWhileRevalidateSeconds: 24 * 60 * 60,
} as const;

const skillIconSchema = z.custom<SkillIconKey>(
  (value): value is SkillIconKey => typeof value === "string" && isSkillIconKey(value),
);

export const publicHomeDataSchema = z.object({
  featuredProjects: z.array(
    z.object({
      createdAtLabel: z.string(),
      description: z.string().nullable(),
      liveUrl: z.string().nullable(),
      repositoryUrl: z.string().nullable(),
      slug: z.string(),
      summary: z.string(),
      title: z.string(),
    }),
  ),
  skills: z.array(
    z.object({
      iconKey: skillIconSchema,
      name: z.string(),
      sortOrder: z.number(),
      summary: z.string(),
    }),
  ),
});

export function buildPublicHomeCacheKey(request: Request) {
  return new URL("/__cache/public/home-data", request.url).toString();
}
