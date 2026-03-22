import { hashPassword } from "better-auth/crypto";
import { and, asc, desc, eq, ne, sql } from "drizzle-orm";

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

function formatDateLabel(value: Date) {
  return value.toISOString().slice(0, 10);
}

function normalizeNullableString(value: string) {
  return value.length > 0 ? value : null;
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

  return result.map((user) => ({
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    createdAtLabel: formatDateLabel(user.createdAt),
    displayName: user.displayName,
    email: user.email,
    id: user.id,
    isActive: user.isActive,
    role: user.role,
    updatedAtLabel: formatDateLabel(user.updatedAt),
  }));
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
