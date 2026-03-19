import type { PublicProjectCard } from "~/lib/projects/projects.server";

export const PUBLIC_PROJECTS_PAGE_SIZE = 6;

export const PUBLIC_PROJECTS_QUERY_PARAM = {
  page: "page",
} as const;

export const PUBLIC_PROJECTS_COPY = {
  emptyBody:
    "Published project cards will appear here as soon as the first public case studies are ready.",
  emptyEyebrow: "Project Registry",
  emptyTitle: "No public projects yet.",
  feedLoading: "Loading next set...",
  feedReady: "Scroll to load more projects",
  featuredBadge: "Featured",
  heroBody:
    "A public registry of shipped interfaces, content systems, and dashboard flows built for fast routes, clear data contracts, and maintainable delivery.",
  heroEyebrow: "Selected Builds / Public Registry",
  heroTitle: "Projects That Ship With Sharp Edges.",
  liveCta: "Live Build",
  repoCta: "Source",
  scrollHint: "Automatic loading continues as you scroll down.",
  statFeatured: "Featured",
  statLive: "Live Links",
  statTotal: "Published",
  techLabel: "Stack Focus",
} as const;

export interface PublicProjectsLoaderData {
  nextPage: number | null;
  projects: PublicProjectCard[];
  stats: {
    featuredCount: number;
    liveCount: number;
    totalCount: number;
  };
}

export interface PublicProjectsFeedLoaderData {
  page: number;
  nextPage: number | null;
  projects: PublicProjectCard[];
}

export function normalizePublicProjectsPage(value: string | null) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

export function buildPublicProjectsFeedHref(page: number) {
  return `/projects/feed?${PUBLIC_PROJECTS_QUERY_PARAM.page}=${page}`;
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
