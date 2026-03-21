import { and, asc, desc, eq, gt, lt, ne, or, sql } from "drizzle-orm";

import type { AppDb } from "../../../db";
import { projects } from "../../../db/schema";
import { PROJECT_STATUS, type ProjectStatus } from "~/features/projects/project.shared";
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

function encodePublicProjectsCursor(cursor: PublicProjectsCursorInput) {
  return JSON.stringify(cursor);
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
