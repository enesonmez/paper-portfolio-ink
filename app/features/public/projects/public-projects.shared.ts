import type { PublicProjectCard } from "~/lib/projects/projects.server";
import { z } from "zod";
import { useT } from "~/features/i18n/i18n-react";
import type { I18nTranslator } from "~/features/i18n/i18n.shared";

export const PUBLIC_PROJECTS_PAGE_SIZE = 6;

export const PUBLIC_PROJECTS_QUERY_PARAM = {
  cursor: "cursor",
} as const;

export function buildPublicProjectsCopy(t: I18nTranslator) {
  return {
    emptyBody: t("public.projects.emptyBody"),
    emptyEyebrow: t("public.projects.emptyEyebrow"),
    emptyTitle: t("public.projects.emptyTitle"),
    feedLoading: t("public.projects.feedLoading"),
    feedReady: t("public.projects.feedReady"),
    featuredBadge: t("public.projects.featuredBadge"),
    heroBody: t("public.projects.heroBody"),
    heroEyebrow: t("public.projects.heroEyebrow"),
    heroTitle: t("public.projects.heroTitle"),
    liveCta: t("public.projects.liveCta"),
    repoCta: t("public.projects.repoCta"),
    scrollHint: t("public.projects.scrollHint"),
    statFeatured: t("public.projects.statFeatured"),
    statLive: t("public.projects.statLive"),
    statTotal: t("public.projects.statTotal"),
    techLabel: t("public.projects.techLabel"),
  } as const;
}

export function usePublicProjectsCopy() {
  const t = useT();

  return buildPublicProjectsCopy(t);
}

export interface PublicProjectsLoaderData {
  nextCursor: string | null;
  projects: PublicProjectCard[];
  stats: {
    featuredCount: number;
    liveCount: number;
    totalCount: number;
  };
}

export interface PublicProjectsFeedLoaderData {
  cursor: string | null;
  nextCursor: string | null;
  projects: PublicProjectCard[];
}

const publicProjectsCursorSchema = z.object({
  createdAtIso: z.string().datetime(),
  isFeatured: z.boolean(),
  slug: z.string().min(1),
  sortOrder: z.number().int().nonnegative(),
});

export type PublicProjectsCursor = z.infer<typeof publicProjectsCursorSchema>;

export function parsePublicProjectsCursor(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    const result = publicProjectsCursorSchema.safeParse(parsed);

    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function buildPublicProjectsFeedHref(cursor: string) {
  return `/projects/feed?${new URLSearchParams({
    [PUBLIC_PROJECTS_QUERY_PARAM.cursor]: cursor,
  }).toString()}`;
}

export function mergePublicProjects(
  existing: PublicProjectCard[],
  incoming: PublicProjectCard[],
) {
  const seen = new Set(existing.map((project) => project.slug));
  const merged = [...existing];

  for (const project of incoming) {
    if (seen.has(project.slug)) {
      continue;
    }

    seen.add(project.slug);
    merged.push(project);
  }

  return merged;
}
