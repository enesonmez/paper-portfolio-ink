import { and, eq, gt, ne } from "drizzle-orm";
import type { AppDb } from "../../../db";
import { sessions, users } from "../../../db/schema";

export async function listActiveSessions(db: AppDb, userId?: string) {
  const baseQuery = db
    .select({
      id: sessions.id,
      token: sessions.token,
      ipAddress: sessions.ipAddress,
      userAgent: sessions.userAgent,
      expiresAt: sessions.expiresAt,
      createdAt: sessions.createdAt,
      user: {
        displayName: users.displayName,
        email: users.email,
        role: users.role,
      },
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id));

  if (userId) {
    return baseQuery.where(
      and(eq(sessions.userId, userId), gt(sessions.expiresAt, new Date())),
    );
  }

  return baseQuery.where(gt(sessions.expiresAt, new Date()));
}

export async function deleteSession(db: AppDb, id: string) {
  await db.delete(sessions).where(eq(sessions.id, id));
}

export async function getSessionById(db: AppDb, id: string) {
  const result = await db
    .select({
      id: sessions.id,
      userId: sessions.userId,
    })
    .from(sessions)
    .where(eq(sessions.id, id))
    .limit(1);

  return result[0] || null;
}

export async function deleteOtherSessions(
  db: AppDb,
  userId: string,
  currentToken: string,
) {
  await db
    .delete(sessions)
    .where(and(eq(sessions.userId, userId), ne(sessions.token, currentToken)));
}

export async function deleteAllOtherSessions(db: AppDb, currentToken: string) {
  await db.delete(sessions).where(ne(sessions.token, currentToken));
}
