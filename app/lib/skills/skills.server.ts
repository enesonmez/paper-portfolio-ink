import { and, asc, desc, eq, gt, like, lt, ne, or, sql } from "drizzle-orm";
import { z } from "zod";

import type { AppDb } from "../../../db";
import { skills } from "../../../db/schema";
import type { SkillIconKey } from "~/domain/skills/icons";
import { suggestSlugFromTitle } from "~/lib/slug";

import type { SkillSubmission } from "./skill-form.server";

export interface PublicSkill {
  iconKey: SkillIconKey;
  name: string;
  sortOrder: number;
  summary: string;
}

export interface SkillOverview {
  createdAtLabel: string;
  iconKey: SkillIconKey;
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  summary: string;
}

export interface DashboardSkillsCursor {
  createdAtIso: string;
  name: string;
  slug: string;
  sortOrder: number;
}

export interface DashboardSkillsPage {
  items: SkillOverview[];
  pagination: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor: string | null;
    previousCursor: string | null;
  };
  totalCount: number;
}

function formatSkillDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function buildSkillPersistenceValues(submission: SkillSubmission) {
  return {
    iconKey: submission.iconKey,
    name: submission.name,
    sortOrder: submission.sortOrder,
    slug: suggestSlugFromTitle(submission.name),
    summary: submission.summary,
  };
}

const SKILLS_ORDER_BY = [
  asc(skills.sortOrder),
  asc(skills.name),
  asc(skills.createdAt),
  asc(skills.slug),
] as const;

interface DashboardSkillsCursorRecord {
  createdAt: Date;
  name: string;
  slug: string;
  sortOrder: number;
}

const dashboardSkillsCursorSchema = z.object({
  createdAtIso: z.string().datetime(),
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  sortOrder: z.number().int(),
});

export function buildDashboardSkillsCursor(cursor: DashboardSkillsCursor) {
  return JSON.stringify(cursor);
}

export function parseDashboardSkillsCursor(
  value: string | null,
): DashboardSkillsCursorRecord | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = dashboardSkillsCursorSchema.parse(JSON.parse(value));

    return {
      createdAt: new Date(parsed.createdAtIso),
      name: parsed.name,
      slug: parsed.slug,
      sortOrder: parsed.sortOrder,
    };
  } catch {
    return null;
  }
}

function buildDashboardSkillsCursorWhere(cursor: DashboardSkillsCursorRecord) {
  return or(
    gt(skills.sortOrder, cursor.sortOrder),
    and(eq(skills.sortOrder, cursor.sortOrder), gt(skills.name, cursor.name)),
    and(
      eq(skills.sortOrder, cursor.sortOrder),
      eq(skills.name, cursor.name),
      gt(skills.createdAt, cursor.createdAt),
    ),
    and(
      eq(skills.sortOrder, cursor.sortOrder),
      eq(skills.name, cursor.name),
      eq(skills.createdAt, cursor.createdAt),
      gt(skills.slug, cursor.slug),
    ),
  );
}

function buildDashboardSkillsPreviousCursorWhere(cursor: DashboardSkillsCursorRecord) {
  return or(
    lt(skills.sortOrder, cursor.sortOrder),
    and(eq(skills.sortOrder, cursor.sortOrder), lt(skills.name, cursor.name)),
    and(
      eq(skills.sortOrder, cursor.sortOrder),
      eq(skills.name, cursor.name),
      lt(skills.createdAt, cursor.createdAt),
    ),
    and(
      eq(skills.sortOrder, cursor.sortOrder),
      eq(skills.name, cursor.name),
      eq(skills.createdAt, cursor.createdAt),
      lt(skills.slug, cursor.slug),
    ),
  );
}

function buildDashboardSkillsSearchFilter(searchQuery: string) {
  if (searchQuery.length === 0) {
    return undefined;
  }

  const pattern = `%${searchQuery}%`;

  return or(
    like(skills.name, pattern),
    like(skills.slug, pattern),
    like(skills.summary, pattern),
  );
}

function mapPublicSkill(skill: {
  iconKey: string;
  name: string;
  sortOrder: number;
  summary: string;
}): PublicSkill {
  return {
    iconKey: skill.iconKey as SkillIconKey,
    name: skill.name,
    sortOrder: skill.sortOrder,
    summary: skill.summary,
  };
}

export async function listPublicSkills(db: AppDb): Promise<PublicSkill[]> {
  const result = await db
    .select({
      iconKey: skills.iconKey,
      name: skills.name,
      sortOrder: skills.sortOrder,
      summary: skills.summary,
    })
    .from(skills)
    .orderBy(...SKILLS_ORDER_BY);

  return result.map(mapPublicSkill);
}

export async function listSkills(db: AppDb): Promise<SkillOverview[]> {
  const result = await db
    .select({
      createdAt: skills.createdAt,
      iconKey: skills.iconKey,
      id: skills.id,
      name: skills.name,
      sortOrder: skills.sortOrder,
      slug: skills.slug,
      summary: skills.summary,
    })
    .from(skills)
    .orderBy(...SKILLS_ORDER_BY);

  return result.map((skill) => ({
    createdAtLabel: formatSkillDate(skill.createdAt),
    id: skill.id,
    slug: skill.slug,
    ...mapPublicSkill(skill),
  }));
}

export async function listSkillsPage(
  db: AppDb,
  options: {
    cursor?: DashboardSkillsCursorRecord | null;
    direction?: "next" | "previous";
    pageSize: number;
    searchQuery?: string;
  },
): Promise<DashboardSkillsPage> {
  const direction = options.direction ?? "next";
  const filters = [
    buildDashboardSkillsSearchFilter(options.searchQuery ?? ""),
    options.cursor
      ? direction === "previous"
        ? buildDashboardSkillsPreviousCursorWhere(options.cursor)
        : buildDashboardSkillsCursorWhere(options.cursor)
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
      createdAt: skills.createdAt,
      iconKey: skills.iconKey,
      id: skills.id,
      name: skills.name,
      sortOrder: skills.sortOrder,
      slug: skills.slug,
      summary: skills.summary,
    })
    .from(skills)
    .$dynamic();

  if (whereClause) {
    pageQuery = pageQuery.where(whereClause);
  }

  const orderedRows = await pageQuery
    .orderBy(
      direction === "previous" ? desc(skills.sortOrder) : asc(skills.sortOrder),
      direction === "previous" ? desc(skills.name) : asc(skills.name),
      direction === "previous" ? desc(skills.createdAt) : asc(skills.createdAt),
      direction === "previous" ? desc(skills.slug) : asc(skills.slug),
    )
    .limit(options.pageSize + 1);
  const visibleRows = orderedRows.slice(0, options.pageSize);
  const items = direction === "previous" ? [...visibleRows].reverse() : visibleRows;
  let totalQuery = db
    .select({ totalCount: sql<number>`count(*)` })
    .from(skills)
    .$dynamic();

  if (options.searchQuery && options.searchQuery.trim().length > 0) {
    const searchFilter = buildDashboardSkillsSearchFilter(options.searchQuery.trim());

    if (searchFilter) {
      totalQuery = totalQuery.where(searchFilter);
    }
  }

  const [totalResult] = await totalQuery;
  const firstItem = items[0];
  const lastItem = items.at(-1);
  const hasExtraRow = orderedRows.length > options.pageSize;
  const hasNextPage = direction === "previous" ? Boolean(options.cursor) : hasExtraRow;
  const hasPreviousPage =
    direction === "previous" ? hasExtraRow : Boolean(options.cursor);

  return {
    items: items.map((skill) => ({
      createdAtLabel: formatSkillDate(skill.createdAt),
      id: skill.id,
      slug: skill.slug,
      ...mapPublicSkill(skill),
    })),
    pagination: {
      hasNextPage,
      hasPreviousPage,
      nextCursor:
        hasNextPage && lastItem
          ? buildDashboardSkillsCursor({
              createdAtIso: lastItem.createdAt.toISOString(),
              name: lastItem.name,
              slug: lastItem.slug,
              sortOrder: lastItem.sortOrder,
            })
          : null,
      previousCursor:
        hasPreviousPage && firstItem
          ? buildDashboardSkillsCursor({
              createdAtIso: firstItem.createdAt.toISOString(),
              name: firstItem.name,
              slug: firstItem.slug,
              sortOrder: firstItem.sortOrder,
            })
          : null,
    },
    totalCount: Number(totalResult?.totalCount ?? 0),
  };
}

export async function getSkillById(
  db: AppDb,
  skillId: string,
): Promise<SkillOverview | null> {
  const [skill] = await db
    .select({
      createdAt: skills.createdAt,
      iconKey: skills.iconKey,
      id: skills.id,
      name: skills.name,
      sortOrder: skills.sortOrder,
      slug: skills.slug,
      summary: skills.summary,
    })
    .from(skills)
    .where(eq(skills.id, skillId))
    .limit(1);

  if (!skill) {
    return null;
  }

  return {
    createdAtLabel: formatSkillDate(skill.createdAt),
    id: skill.id,
    slug: skill.slug,
    ...mapPublicSkill(skill),
  };
}

export async function isSkillSlugTaken(
  db: AppDb,
  slug: string,
  excludedSkillId?: string,
) {
  const [skill] = await db
    .select({ id: skills.id })
    .from(skills)
    .where(
      excludedSkillId
        ? and(eq(skills.slug, slug), ne(skills.id, excludedSkillId))
        : eq(skills.slug, slug),
    )
    .limit(1);

  return Boolean(skill);
}

export async function createSkill(db: AppDb, submission: SkillSubmission) {
  await db.insert(skills).values(buildSkillPersistenceValues(submission));
}

export async function updateSkill(
  db: AppDb,
  skillId: string,
  submission: SkillSubmission,
) {
  await db
    .update(skills)
    .set({
      ...buildSkillPersistenceValues(submission),
      updatedAt: new Date(),
    })
    .where(eq(skills.id, skillId));
}

export async function deleteSkill(db: AppDb, skillId: string) {
  await db.delete(skills).where(eq(skills.id, skillId));
}
