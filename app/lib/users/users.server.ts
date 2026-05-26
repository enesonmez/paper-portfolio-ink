import { hashPassword } from "better-auth/crypto";
import { and, asc, desc, eq, gt, like, lt, ne, or, sql } from "drizzle-orm";
import { z } from "zod";

import type { AppDb } from "../../../db";
import { accounts, users } from "../../../db/schema";
import { USER_ROLE, type UserRole } from "~/domain/users/model";

import type { UserSubmission } from "./user-form.server";

export interface UserOverview {
  avatarUrl: string | null;
  bio: string | null;
  createdAtLabel: string;
  displayName: string;
  email: string;
  id: string;
  isActive: boolean;
  role: UserRole;
  updatedAtLabel: string;
}

export interface UserRecord {
  email: string;
  id: string;
  isActive: boolean;
  role: UserRole;
}

export interface DashboardUsersMetrics {
  adminCount: number;
  authorCount: number;
  totalCount: number;
}

export interface DashboardUsersCursor {
  displayName: string;
  email: string;
  id: string;
  isActive: boolean;
  role: UserRole;
}

export interface DashboardUsersPage {
  items: UserOverview[];
  metrics: DashboardUsersMetrics;
  pagination: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor: string | null;
    previousCursor: string | null;
  };
}

interface DashboardUsersCursorRecord {
  displayName: string;
  email: string;
  id: string;
  isActive: boolean;
  role: UserRole;
}

const dashboardUsersCursorSchema = z.object({
  displayName: z.string().trim().min(1),
  email: z.string().trim().email(),
  id: z.string().trim().min(1),
  isActive: z.boolean(),
  role: z.enum([USER_ROLE.admin, USER_ROLE.author]),
});

function formatDateLabel(value: Date) {
  return value.toISOString().slice(0, 10);
}

function normalizeNullableString(value: string) {
  return value.length > 0 ? value : null;
}

function toUserOverview(user: {
  avatarUrl: string | null;
  bio: string | null;
  createdAt: Date;
  displayName: string;
  email: string;
  id: string;
  isActive: boolean;
  role: UserRole;
  updatedAt: Date;
}): UserOverview {
  return {
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    createdAtLabel: formatDateLabel(user.createdAt),
    displayName: user.displayName,
    email: user.email,
    id: user.id,
    isActive: user.isActive,
    role: user.role,
    updatedAtLabel: formatDateLabel(user.updatedAt),
  };
}

export function buildDashboardUsersCursor(cursor: DashboardUsersCursor) {
  return JSON.stringify(cursor);
}

export function parseDashboardUsersCursor(
  value: string | null,
): DashboardUsersCursorRecord | null {
  if (!value) {
    return null;
  }

  try {
    return dashboardUsersCursorSchema.parse(JSON.parse(value));
  } catch {
    return null;
  }
}

function buildDashboardUsersSearchFilter(searchQuery: string) {
  if (searchQuery.length === 0) {
    return undefined;
  }

  const pattern = `%${searchQuery}%`;

  return or(like(users.displayName, pattern), like(users.email, pattern));
}

function buildDashboardUsersCursorWhere(cursor: DashboardUsersCursorRecord) {
  return or(
    lt(users.isActive, cursor.isActive),
    and(eq(users.isActive, cursor.isActive), gt(users.role, cursor.role)),
    and(
      eq(users.isActive, cursor.isActive),
      eq(users.role, cursor.role),
      gt(users.displayName, cursor.displayName),
    ),
    and(
      eq(users.isActive, cursor.isActive),
      eq(users.role, cursor.role),
      eq(users.displayName, cursor.displayName),
      gt(users.email, cursor.email),
    ),
    and(
      eq(users.isActive, cursor.isActive),
      eq(users.role, cursor.role),
      eq(users.displayName, cursor.displayName),
      eq(users.email, cursor.email),
      gt(users.id, cursor.id),
    ),
  );
}

function buildDashboardUsersPreviousCursorWhere(cursor: DashboardUsersCursorRecord) {
  return or(
    gt(users.isActive, cursor.isActive),
    and(eq(users.isActive, cursor.isActive), lt(users.role, cursor.role)),
    and(
      eq(users.isActive, cursor.isActive),
      eq(users.role, cursor.role),
      lt(users.displayName, cursor.displayName),
    ),
    and(
      eq(users.isActive, cursor.isActive),
      eq(users.role, cursor.role),
      eq(users.displayName, cursor.displayName),
      lt(users.email, cursor.email),
    ),
    and(
      eq(users.isActive, cursor.isActive),
      eq(users.role, cursor.role),
      eq(users.displayName, cursor.displayName),
      eq(users.email, cursor.email),
      lt(users.id, cursor.id),
    ),
  );
}

export function isUniqueUserEmailConstraintError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.message.includes("UNIQUE constraint failed: users.email");
}

export async function listUsers(db: AppDb): Promise<UserOverview[]> {
  const result = await db
    .select({
      avatarUrl: users.avatarUrl,
      bio: users.bio,
      createdAt: users.createdAt,
      displayName: users.displayName,
      email: users.email,
      id: users.id,
      isActive: users.isActive,
      role: users.role,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .orderBy(
      desc(users.isActive),
      asc(users.role),
      asc(users.displayName),
      asc(users.email),
    );

  return result.map((user) => toUserOverview({ ...user, role: user.role }));
}

export async function listUsersPage(
  db: AppDb,
  options: {
    active?: boolean;
    cursor?: DashboardUsersCursorRecord | null;
    direction?: "next" | "previous";
    pageSize: number;
    role?: UserRole;
    searchQuery?: string;
  },
): Promise<DashboardUsersPage> {
  const direction = options.direction ?? "next";
  const filters = [
    options.active === undefined ? undefined : eq(users.isActive, options.active),
    options.role ? eq(users.role, options.role) : undefined,
    buildDashboardUsersSearchFilter(options.searchQuery ?? ""),
    options.cursor
      ? direction === "previous"
        ? buildDashboardUsersPreviousCursorWhere(options.cursor)
        : buildDashboardUsersCursorWhere(options.cursor)
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
      avatarUrl: users.avatarUrl,
      bio: users.bio,
      createdAt: users.createdAt,
      displayName: users.displayName,
      email: users.email,
      id: users.id,
      isActive: users.isActive,
      role: users.role,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .$dynamic();

  if (whereClause) {
    pageQuery = pageQuery.where(whereClause);
  }

  const orderedRows = await pageQuery
    .orderBy(
      direction === "previous" ? asc(users.isActive) : desc(users.isActive),
      direction === "previous" ? desc(users.role) : asc(users.role),
      direction === "previous" ? desc(users.displayName) : asc(users.displayName),
      direction === "previous" ? desc(users.email) : asc(users.email),
      direction === "previous" ? desc(users.id) : asc(users.id),
    )
    .limit(options.pageSize + 1);
  const visibleRows = orderedRows.slice(0, options.pageSize);
  const items = direction === "previous" ? [...visibleRows].reverse() : visibleRows;
  const metricsFilters = [
    options.active === undefined ? undefined : eq(users.isActive, options.active),
    options.role ? eq(users.role, options.role) : undefined,
    buildDashboardUsersSearchFilter(options.searchQuery ?? ""),
  ].filter((filter) => filter !== undefined);
  const metricsWhere =
    metricsFilters.length === 0
      ? undefined
      : metricsFilters.length === 1
        ? metricsFilters[0]
        : and(...metricsFilters);
  let metricsQuery = db
    .select({
      adminCount: sql<number>`sum(case when ${users.role} = 'admin' then 1 else 0 end)`,
      authorCount: sql<number>`sum(case when ${users.role} = 'author' then 1 else 0 end)`,
      totalCount: sql<number>`count(*)`,
    })
    .from(users)
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
    items: items.map((user) => toUserOverview({ ...user, role: user.role })),
    metrics: {
      adminCount: Number(metrics?.adminCount ?? 0),
      authorCount: Number(metrics?.authorCount ?? 0),
      totalCount: Number(metrics?.totalCount ?? 0),
    },
    pagination: {
      hasNextPage,
      hasPreviousPage,
      nextCursor:
        hasNextPage && lastItem
          ? buildDashboardUsersCursor({
              displayName: lastItem.displayName,
              email: lastItem.email,
              id: lastItem.id,
              isActive: lastItem.isActive,
              role: lastItem.role,
            })
          : null,
      previousCursor:
        hasPreviousPage && firstItem
          ? buildDashboardUsersCursor({
              displayName: firstItem.displayName,
              email: firstItem.email,
              id: firstItem.id,
              isActive: firstItem.isActive,
              role: firstItem.role,
            })
          : null,
    },
  };
}

export async function getUserOverviewById(
  db: AppDb,
  userId: string,
): Promise<UserOverview | null> {
  const [user] = await db
    .select({
      avatarUrl: users.avatarUrl,
      bio: users.bio,
      createdAt: users.createdAt,
      displayName: users.displayName,
      email: users.email,
      id: users.id,
      isActive: users.isActive,
      role: users.role,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return null;
  }

  return toUserOverview({ ...user, role: user.role });
}

export async function findUserByEmail(
  db: AppDb,
  email: string,
): Promise<UserRecord | null> {
  const [user] = await db
    .select({
      email: users.email,
      id: users.id,
      isActive: users.isActive,
      role: users.role,
    })
    .from(users)
    .where(eq(users.email, email.trim().toLowerCase()))
    .limit(1);

  return user ?? null;
}

export async function getUserById(
  db: AppDb,
  userId: string,
): Promise<UserRecord | null> {
  const [user] = await db
    .select({
      email: users.email,
      id: users.id,
      isActive: users.isActive,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user ?? null;
}

export async function countActiveAdmins(db: AppDb) {
  const [result] = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(users)
    .where(and(eq(users.role, USER_ROLE.admin), eq(users.isActive, true)));

  return Number(result?.count ?? 0);
}

export async function isUserEmailTaken(
  db: AppDb,
  email: string,
  excludedUserId?: string,
) {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(
      excludedUserId
        ? and(eq(users.email, email), ne(users.id, excludedUserId))
        : eq(users.email, email),
    )
    .limit(1);

  return Boolean(user);
}

export async function createUser(db: AppDb, submission: UserSubmission) {
  const userId = crypto.randomUUID();
  const accountId = crypto.randomUUID();
  const timestamp = new Date();
  const passwordHash = await hashPassword(submission.password);

  await db.batch([
    db.insert(users).values({
      avatarUrl: normalizeNullableString(submission.avatarUrl),
      bio: normalizeNullableString(submission.bio),
      createdAt: timestamp,
      displayName: submission.displayName,
      email: submission.email,
      id: userId,
      isActive: submission.isActive,
      role: submission.role,
      updatedAt: timestamp,
    }),
    db.insert(accounts).values({
      accountId: userId,
      createdAt: timestamp,
      id: accountId,
      password: passwordHash,
      providerId: "credential",
      updatedAt: timestamp,
      userId,
    }),
  ]);
}

export async function updateUser(
  db: AppDb,
  userId: string,
  submission: UserSubmission,
) {
  const timestamp = new Date();

  await db
    .update(users)
    .set({
      avatarUrl: normalizeNullableString(submission.avatarUrl),
      authzVersion: sql`${users.authzVersion} + 1`,
      bio: normalizeNullableString(submission.bio),
      displayName: submission.displayName,
      email: submission.email,
      isActive: submission.isActive,
      role: submission.role,
      updatedAt: timestamp,
    })
    .where(eq(users.id, userId));

  if (submission.password.length === 0) {
    return;
  }

  const passwordHash = await hashPassword(submission.password);

  await db
    .update(accounts)
    .set({
      password: passwordHash,
      updatedAt: timestamp,
    })
    .where(and(eq(accounts.userId, userId), eq(accounts.providerId, "credential")));
}

export async function deactivateUser(db: AppDb, userId: string) {
  await db
    .update(users)
    .set({
      authzVersion: sql`${users.authzVersion} + 1`,
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

export function isLastActiveAdminConstraintError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message.includes("cannot deactivate the last active admin") ||
    error.message.includes("cannot demote the last active admin") ||
    error.message.includes("cannot delete the last active admin")
  );
}
