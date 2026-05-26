import { and, asc, desc, eq, gt, like, lt, ne, or, sql } from "drizzle-orm";
import { z } from "zod";

import type { AppDb } from "../../../db";
import { projects } from "../../../db/schema";
import { PROJECT_STATUS, type ProjectStatus } from "~/domain/projects/model";
import { findNextAvailableSlug, suggestSlugFromTitle } from "~/lib/slug";

import type { ProjectSubmission } from "./project-form.server";

export interface ProjectOverview {
  coverImageUrl: string | null;
  createdAtLabel: string;
  id: string;
  isFeatured: boolean;
  liveUrl: string | null;
  repositoryUrl: string | null;
  slug: string;
  sortOrder: number;
  status: ProjectStatus;
  summary: string;
  description: string | null;
  title: string;
}

export interface PublicFeaturedProject {
  createdAtLabel: string;
  description: string | null;
  liveUrl: string | null;
  repositoryUrl: string | null;
  slug: string;
  summary: string;
  title: string;
}

export interface PublicProjectCard {
  coverImageUrl: string | null;
  createdAtLabel: string;
  description: string | null;
  isFeatured: boolean;
  liveUrl: string | null;
  repositoryUrl: string | null;
  slug: string;
  summary: string;
  title: string;
}

export interface PublicProjectsPage {
  items: PublicProjectCard[];
  nextCursor: string | null;
}

export interface PublicProjectsStats {
  featuredCount: number;
  liveCount: number;
  totalCount: number;
}

export interface DashboardProjectsMetrics {
  featuredCount: number;
  liveCount: number;
  totalCount: number;
}

export interface DashboardProjectsCursor {
  createdAtIso: string;
  isFeatured: boolean;
  slug: string;
  sortOrder: number;
}

export interface DashboardProjectsPage {
  items: ProjectOverview[];
  metrics: DashboardProjectsMetrics;
  pagination: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor: string | null;
    previousCursor: string | null;
  };
}

function formatProjectDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function normalizeNullableUrl(value: string) {
  return value.length > 0 ? value : null;
}

interface PublicProjectsCursorInput {
  createdAtIso: string;
  isFeatured: boolean;
  slug: string;
  sortOrder: number;
}

interface PublicProjectsCursorRecord {
  createdAt: Date;
  isFeatured: boolean;
  slug: string;
  sortOrder: number;
}

type DashboardProjectsCursorRecord = PublicProjectsCursorRecord;

const dashboardProjectsCursorSchema = z.object({
  createdAtIso: z.string().datetime(),
  isFeatured: z.boolean(),
  slug: z.string().trim().min(1),
  sortOrder: z.number().int(),
});

function encodePublicProjectsCursor(cursor: PublicProjectsCursorInput) {
  return JSON.stringify(cursor);
}

export function buildDashboardProjectsCursor(cursor: DashboardProjectsCursor) {
  return JSON.stringify(cursor);
}

export function parseDashboardProjectsCursor(
  value: string | null,
): DashboardProjectsCursorRecord | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = dashboardProjectsCursorSchema.parse(JSON.parse(value));

    return {
      createdAt: new Date(parsed.createdAtIso),
      isFeatured: parsed.isFeatured,
      slug: parsed.slug,
      sortOrder: parsed.sortOrder,
    };
  } catch {
    return null;
  }
}

function buildPublicProjectsCursorWhere(cursor: PublicProjectsCursorRecord) {
  const sharedFeaturedBranch = [
    and(
      eq(projects.isFeatured, cursor.isFeatured),
      gt(projects.sortOrder, cursor.sortOrder),
    ),
    and(
      eq(projects.isFeatured, cursor.isFeatured),
      eq(projects.sortOrder, cursor.sortOrder),
      lt(projects.createdAt, cursor.createdAt),
    ),
    and(
      eq(projects.isFeatured, cursor.isFeatured),
      eq(projects.sortOrder, cursor.sortOrder),
      eq(projects.createdAt, cursor.createdAt),
      gt(projects.slug, cursor.slug),
    ),
  ];

  if (cursor.isFeatured) {
    return or(eq(projects.isFeatured, false), ...sharedFeaturedBranch);
  }

  return or(...sharedFeaturedBranch);
}

function buildDashboardProjectsCursorWhere(cursor: DashboardProjectsCursorRecord) {
  const sharedFeaturedBranch = [
    and(
      eq(projects.isFeatured, cursor.isFeatured),
      gt(projects.sortOrder, cursor.sortOrder),
    ),
    and(
      eq(projects.isFeatured, cursor.isFeatured),
      eq(projects.sortOrder, cursor.sortOrder),
      lt(projects.createdAt, cursor.createdAt),
    ),
    and(
      eq(projects.isFeatured, cursor.isFeatured),
      eq(projects.sortOrder, cursor.sortOrder),
      eq(projects.createdAt, cursor.createdAt),
      gt(projects.slug, cursor.slug),
    ),
  ];

  if (cursor.isFeatured) {
    return or(eq(projects.isFeatured, false), ...sharedFeaturedBranch);
  }

  return or(...sharedFeaturedBranch);
}

function buildDashboardProjectsPreviousCursorWhere(
  cursor: DashboardProjectsCursorRecord,
) {
  const sharedFeaturedBranch = [
    and(
      eq(projects.isFeatured, cursor.isFeatured),
      lt(projects.sortOrder, cursor.sortOrder),
    ),
    and(
      eq(projects.isFeatured, cursor.isFeatured),
      eq(projects.sortOrder, cursor.sortOrder),
      gt(projects.createdAt, cursor.createdAt),
    ),
    and(
      eq(projects.isFeatured, cursor.isFeatured),
      eq(projects.sortOrder, cursor.sortOrder),
      eq(projects.createdAt, cursor.createdAt),
      lt(projects.slug, cursor.slug),
    ),
  ];

  if (cursor.isFeatured) {
    return or(...sharedFeaturedBranch);
  }

  return or(eq(projects.isFeatured, true), ...sharedFeaturedBranch);
}

function buildDashboardProjectsSearchFilter(searchQuery: string) {
  if (searchQuery.length === 0) {
    return undefined;
  }

  const pattern = `%${searchQuery}%`;

  return or(
    like(projects.title, pattern),
    like(projects.slug, pattern),
    like(projects.summary, pattern),
  );
}

function toProjectOverview(project: {
  coverImageUrl: string | null;
  createdAt: Date;
  id: string;
  isFeatured: boolean;
  liveUrl: string | null;
  repositoryUrl: string | null;
  slug: string;
  sortOrder: number;
  status: ProjectStatus;
  summary: string;
  description: string | null;
  title: string;
}): ProjectOverview {
  return {
    coverImageUrl: project.coverImageUrl,
    createdAtLabel: formatProjectDate(project.createdAt),
    id: project.id,
    isFeatured: project.isFeatured,
    liveUrl: project.liveUrl,
    repositoryUrl: project.repositoryUrl,
    slug: project.slug,
    sortOrder: project.sortOrder,
    status: project.status,
    summary: project.summary,
    description: project.description,
    title: project.title,
  };
}

export async function listProjects(db: AppDb): Promise<ProjectOverview[]> {
  const result = await db
    .select({
      coverImageUrl: projects.coverImageUrl,
      createdAt: projects.createdAt,
      id: projects.id,
      isFeatured: projects.isFeatured,
      liveUrl: projects.liveUrl,
      repositoryUrl: projects.repositoryUrl,
      slug: projects.slug,
      sortOrder: projects.sortOrder,
      status: projects.status,
      summary: projects.summary,
      description: projects.description,
      title: projects.title,
    })
    .from(projects)
    .orderBy(
      desc(projects.isFeatured),
      asc(projects.sortOrder),
      desc(projects.createdAt),
    );

  return result.map((project) =>
    toProjectOverview({
      ...project,
      status: project.status,
    }),
  );
}

export async function listProjectsPage(
  db: AppDb,
  options: {
    cursor?: DashboardProjectsCursorRecord | null;
    direction?: "next" | "previous";
    pageSize: number;
    searchQuery?: string;
    status?: ProjectStatus;
  },
): Promise<DashboardProjectsPage> {
  const direction = options.direction ?? "next";
  const filters = [
    options.status ? eq(projects.status, options.status) : undefined,
    buildDashboardProjectsSearchFilter(options.searchQuery ?? ""),
    options.cursor
      ? direction === "previous"
        ? buildDashboardProjectsPreviousCursorWhere(options.cursor)
        : buildDashboardProjectsCursorWhere(options.cursor)
      : undefined,
  ].filter((filter) => filter !== undefined);
  const whereClause =
    filters.length === 0
      ? undefined
      : filters.length === 1
        ? filters[0]
        : and(...filters);
  let pageQuery = db
    .select({
      coverImageUrl: projects.coverImageUrl,
      createdAt: projects.createdAt,
      id: projects.id,
      isFeatured: projects.isFeatured,
      liveUrl: projects.liveUrl,
      repositoryUrl: projects.repositoryUrl,
      slug: projects.slug,
      sortOrder: projects.sortOrder,
      status: projects.status,
      summary: projects.summary,
      description: projects.description,
      title: projects.title,
    })
    .from(projects)
    .$dynamic();

  if (whereClause) {
    pageQuery = pageQuery.where(whereClause);
  }

  const orderedRows = await pageQuery
    .orderBy(
      direction === "previous" ? asc(projects.isFeatured) : desc(projects.isFeatured),
      asc(projects.sortOrder),
      direction === "previous" ? asc(projects.createdAt) : desc(projects.createdAt),
      direction === "previous" ? desc(projects.slug) : asc(projects.slug),
    )
    .limit(options.pageSize + 1);
  const visibleRows = orderedRows.slice(0, options.pageSize);
  const items = direction === "previous" ? [...visibleRows].reverse() : visibleRows;
  const metricsFilters = [
    options.status ? eq(projects.status, options.status) : undefined,
    buildDashboardProjectsSearchFilter(options.searchQuery ?? ""),
  ].filter((filter) => filter !== undefined);
  const metricsWhere =
    metricsFilters.length === 0
      ? undefined
      : metricsFilters.length === 1
        ? metricsFilters[0]
        : and(...metricsFilters);
  let metricsQuery = db
    .select({
      featuredCount: sql<number>`sum(case when ${projects.isFeatured} = 1 then 1 else 0 end)`,
      liveCount: sql<number>`sum(case when ${projects.liveUrl} is not null and ${projects.liveUrl} <> '' then 1 else 0 end)`,
      totalCount: sql<number>`count(*)`,
    })
    .from(projects)
    .$dynamic();

  if (metricsWhere) {
    metricsQuery = metricsQuery.where(metricsWhere);
  }

  const [metrics] = await metricsQuery;
  const firstItem = items[0];
  const lastItem = items.at(-1);
  const hasExtraRow = orderedRows.length > options.pageSize;
  const hasNextPage = direction === "previous" ? Boolean(options.cursor) : hasExtraRow;
  const hasPreviousPage =
    direction === "previous" ? hasExtraRow : Boolean(options.cursor);

  return {
    items: items.map((project) =>
      toProjectOverview({
        ...project,
        status: project.status,
      }),
    ),
    metrics: {
      featuredCount: Number(metrics?.featuredCount ?? 0),
      liveCount: Number(metrics?.liveCount ?? 0),
      totalCount: Number(metrics?.totalCount ?? 0),
    },
    pagination: {
      hasNextPage,
      hasPreviousPage,
      nextCursor:
        hasNextPage && lastItem
          ? buildDashboardProjectsCursor({
              createdAtIso: lastItem.createdAt.toISOString(),
              isFeatured: lastItem.isFeatured,
              slug: lastItem.slug,
              sortOrder: lastItem.sortOrder,
            })
          : null,
      previousCursor:
        hasPreviousPage && firstItem
          ? buildDashboardProjectsCursor({
              createdAtIso: firstItem.createdAt.toISOString(),
              isFeatured: firstItem.isFeatured,
              slug: firstItem.slug,
              sortOrder: firstItem.sortOrder,
            })
          : null,
    },
  };
}

export async function getProjectById(
  db: AppDb,
  projectId: string,
): Promise<ProjectOverview | null> {
  const [project] = await db
    .select({
      coverImageUrl: projects.coverImageUrl,
      createdAt: projects.createdAt,
      id: projects.id,
      isFeatured: projects.isFeatured,
      liveUrl: projects.liveUrl,
      repositoryUrl: projects.repositoryUrl,
      slug: projects.slug,
      sortOrder: projects.sortOrder,
      status: projects.status,
      summary: projects.summary,
      description: projects.description,
      title: projects.title,
    })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project) {
    return null;
  }

  return toProjectOverview({
    ...project,
    status: project.status,
  });
}

export async function listPublicFeaturedProjects(
  db: AppDb,
): Promise<PublicFeaturedProject[]> {
  const result = await db
    .select({
      createdAt: projects.createdAt,
      description: projects.description,
      liveUrl: projects.liveUrl,
      repositoryUrl: projects.repositoryUrl,
      slug: projects.slug,
      summary: projects.summary,
      title: projects.title,
    })
    .from(projects)
    .where(
      and(eq(projects.isFeatured, true), eq(projects.status, PROJECT_STATUS.published)),
    )
    .orderBy(asc(projects.sortOrder), desc(projects.createdAt));

  return result.map((project) => ({
    createdAtLabel: formatProjectDate(project.createdAt),
    description: project.description,
    liveUrl: project.liveUrl,
    repositoryUrl: project.repositoryUrl,
    slug: project.slug,
    summary: project.summary,
    title: project.title,
  }));
}

export async function listPublicProjectsPage(
  db: AppDb,
  pageSize: number,
  cursor?: PublicProjectsCursorRecord | null,
): Promise<PublicProjectsPage> {
  const result = await db
    .select({
      coverImageUrl: projects.coverImageUrl,
      createdAt: projects.createdAt,
      description: projects.description,
      isFeatured: projects.isFeatured,
      liveUrl: projects.liveUrl,
      repositoryUrl: projects.repositoryUrl,
      slug: projects.slug,
      sortOrder: projects.sortOrder,
      summary: projects.summary,
      title: projects.title,
    })
    .from(projects)
    .where(
      cursor
        ? and(
            eq(projects.status, PROJECT_STATUS.published),
            buildPublicProjectsCursorWhere(cursor),
          )
        : eq(projects.status, PROJECT_STATUS.published),
    )
    .orderBy(
      desc(projects.isFeatured),
      asc(projects.sortOrder),
      desc(projects.createdAt),
      asc(projects.slug),
    )
    .limit(pageSize + 1);

  const hasMore = result.length > pageSize;
  const visibleItems = result.slice(0, pageSize);
  const items = visibleItems.map((project) => ({
    coverImageUrl: project.coverImageUrl,
    createdAtLabel: formatProjectDate(project.createdAt),
    description: project.description,
    isFeatured: project.isFeatured,
    liveUrl: project.liveUrl,
    repositoryUrl: project.repositoryUrl,
    slug: project.slug,
    summary: project.summary,
    title: project.title,
  }));
  const lastVisibleItem = visibleItems.at(-1);

  return {
    items,
    nextCursor:
      hasMore && lastVisibleItem
        ? encodePublicProjectsCursor({
            createdAtIso: lastVisibleItem.createdAt.toISOString(),
            isFeatured: lastVisibleItem.isFeatured,
            slug: lastVisibleItem.slug,
            sortOrder: lastVisibleItem.sortOrder,
          })
        : null,
  };
}

export async function getPublicProjectsStats(db: AppDb): Promise<PublicProjectsStats> {
  const [result] = await db
    .select({
      featuredCount: sql<number>`sum(case when ${projects.isFeatured} = 1 then 1 else 0 end)`,
      liveCount: sql<number>`sum(case when ${projects.liveUrl} is not null and ${projects.liveUrl} <> '' then 1 else 0 end)`,
      totalCount: sql<number>`count(*)`,
    })
    .from(projects)
    .where(eq(projects.status, PROJECT_STATUS.published));

  return {
    featuredCount: Number(result?.featuredCount ?? 0),
    liveCount: Number(result?.liveCount ?? 0),
    totalCount: Number(result?.totalCount ?? 0),
  };
}

export async function isProjectSlugTaken(
  db: AppDb,
  slug: string,
  excludedProjectId?: string,
) {
  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(
      excludedProjectId
        ? and(eq(projects.slug, slug), ne(projects.id, excludedProjectId))
        : eq(projects.slug, slug),
    )
    .limit(1);

  return Boolean(project);
}

export async function findAvailableProjectSlug(
  db: AppDb,
  title: string,
  excludedProjectId?: string,
) {
  const baseSlug = suggestSlugFromTitle(title);

  return findNextAvailableSlug(baseSlug, async (slug) =>
    isProjectSlugTaken(db, slug, excludedProjectId),
  );
}

export async function createProject(db: AppDb, submission: ProjectSubmission) {
  await db.insert(projects).values({
    coverImageUrl: normalizeNullableUrl(submission.coverImageUrl),
    description: submission.description || null,
    isFeatured: submission.isFeatured,
    liveUrl: normalizeNullableUrl(submission.liveUrl),
    repositoryUrl: normalizeNullableUrl(submission.repositoryUrl),
    slug: submission.slug,
    sortOrder: submission.sortOrder,
    status: submission.status,
    summary: submission.summary,
    title: submission.title,
  });
}

export async function updateProject(
  db: AppDb,
  projectId: string,
  submission: ProjectSubmission,
) {
  await db
    .update(projects)
    .set({
      coverImageUrl: normalizeNullableUrl(submission.coverImageUrl),
      description: submission.description || null,
      isFeatured: submission.isFeatured,
      liveUrl: normalizeNullableUrl(submission.liveUrl),
      repositoryUrl: normalizeNullableUrl(submission.repositoryUrl),
      slug: submission.slug,
      sortOrder: submission.sortOrder,
      status: submission.status,
      summary: submission.summary,
      title: submission.title,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId));
}

export async function deleteProject(db: AppDb, projectId: string) {
  await db.delete(projects).where(eq(projects.id, projectId));
}
