import { and, eq, lte } from "drizzle-orm";

import type { AppDb } from "../../../db";
import { posts, viewHistory, viewHistoryLocks } from "../../../db/schema";
import { POST_STATUS } from "~/domain/posts/model";

export interface PublishedPostAnalyticsTarget {
  id: string;
  slug: string;
}

export async function getPublishedPostAnalyticsTargetBySlug(
  db: AppDb,
  slug: string,
): Promise<PublishedPostAnalyticsTarget | null> {
  const [post] = await db
    .select({
      id: posts.id,
      slug: posts.slug,
    })
    .from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.status, POST_STATUS.published)))
    .limit(1);

  return post ?? null;
}

export async function insertPostViewHistoryEntry(
  db: AppDb,
  args: {
    postId: string;
    scrollRate: number;
    secondsSpent: number;
    userHash: string;
  },
) {
  await db.insert(viewHistory).values({
    postId: args.postId,
    scrollRate: args.scrollRate,
    secondsSpent: args.secondsSpent,
    userHash: args.userHash,
  });
}

export async function acquirePostViewHistoryLock(
  db: AppDb,
  args: {
    lockedUntil: Date;
    now: Date;
    postId: string;
    userHash: string;
  },
) {
  const result = await db
    .insert(viewHistoryLocks)
    .values({
      lockedUntil: args.lockedUntil,
      postId: args.postId,
      updatedAt: args.now,
      userHash: args.userHash,
    })
    .onConflictDoUpdate({
      set: {
        lockedUntil: args.lockedUntil,
        updatedAt: args.now,
      },
      target: [viewHistoryLocks.postId, viewHistoryLocks.userHash],
      where: lte(viewHistoryLocks.lockedUntil, args.now),
    })
    .returning({
      lockedUntil: viewHistoryLocks.lockedUntil,
      postId: viewHistoryLocks.postId,
      userHash: viewHistoryLocks.userHash,
    });

  return result.length > 0;
}
