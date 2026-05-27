import { and, asc, desc, eq, gt, lt, sql, or, like } from "drizzle-orm";
import { z } from "zod";

import type { AppDb } from "../../../db";
import { posts, viewHistory } from "../../../db/schema";
import { actorHasAnyClaim, type AuthorizationActor } from "~/shared/authz/authz.server";
import { AUTHORIZATION_CLAIM } from "~/shared/authz/model";
import type {
  PostAnalyticsRow,
  ViewsDataPoint,
  MonthlyViewsDataPoint,
} from "~/features/dashboard/analytics/state";

export interface DashboardAnalyticsCursor {
  viewsCount: number;
  updatedAt: number;
  createdAt: number;
  slug: string;
}

export interface DashboardAnalyticsPage {
  items: PostAnalyticsRow[];
  pagination: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor: string | null;
    previousCursor: string | null;
  };
}

const dashboardAnalyticsCursorSchema = z.object({
  viewsCount: z.number().int().nonnegative(),
  updatedAt: z.number().int(),
  createdAt: z.number().int(),
  slug: z.string(),
});

export function buildDashboardAnalyticsCursor(
  cursor: DashboardAnalyticsCursor,
): string {
  return JSON.stringify(cursor);
}

export function parseDashboardAnalyticsCursor(
  value: string | null,
): DashboardAnalyticsCursor | null {
  if (!value) {
    return null;
  }
  try {
    return dashboardAnalyticsCursorSchema.parse(JSON.parse(value));
  } catch {
    return null;
  }
}

export async function getPostAnalyticsDetails(
  db: AppDb,
  postId: string,
  actor: AuthorizationActor,
): Promise<{
  title: string;
  dailyViews: ViewsDataPoint[];
  monthlyViews: MonthlyViewsDataPoint[];
} | null> {
  const [authorizedPost] = await db
    .select({ id: posts.id, title: posts.title })
    .from(posts)
    .where(
      and(
        eq(posts.id, postId),
        actorHasAnyClaim(actor, [AUTHORIZATION_CLAIM.analyticsReadAny])
          ? undefined
          : eq(posts.authorId, actor.userId ?? ""),
      ),
    )
    .limit(1);

  if (!authorizedPost) {
    return null;
  }

  const dailyViews = await db
    .select({
      date: sql<string>`strftime('%Y-%m-%d', datetime(${viewHistory.createdAt} / 1000, 'unixepoch'))`,
      count: sql<number>`count(${viewHistory.id})`,
    })
    .from(viewHistory)
    .where(
      and(
        eq(viewHistory.postId, postId),
        sql`${viewHistory.createdAt} >= ${Date.now() - 30 * 24 * 60 * 60 * 1000}`,
      ),
    )
    .groupBy(
      sql`strftime('%Y-%m-%d', datetime(${viewHistory.createdAt} / 1000, 'unixepoch'))`,
    )
    .orderBy(
      sql`strftime('%Y-%m-%d', datetime(${viewHistory.createdAt} / 1000, 'unixepoch')) asc`,
    );

  const monthlyViews = await db
    .select({
      month: sql<string>`strftime('%Y-%m', datetime(${viewHistory.createdAt} / 1000, 'unixepoch'))`,
      count: sql<number>`count(${viewHistory.id})`,
    })
    .from(viewHistory)
    .where(
      and(
        eq(viewHistory.postId, postId),
        sql`${viewHistory.createdAt} >= ${Date.now() - 365 * 24 * 60 * 60 * 1000}`,
      ),
    )
    .groupBy(
      sql`strftime('%Y-%m', datetime(${viewHistory.createdAt} / 1000, 'unixepoch'))`,
    )
    .orderBy(
      sql`strftime('%Y-%m', datetime(${viewHistory.createdAt} / 1000, 'unixepoch')) asc`,
    );

  return {
    title: authorizedPost.title,
    dailyViews,
    monthlyViews,
  };
}

export async function getOverallAnalyticsMetrics(
  db: AppDb,
  actor: AuthorizationActor,
): Promise<{
  totalViews: number;
  avgScrollRate: number;
  avgTimeSpent: number;
}> {
  const [metricsResult] = await db
    .select({
      totalViews: sql<number>`count(${viewHistory.id})`,
      avgScrollRate: sql<number>`round(coalesce(avg(${viewHistory.scrollRate}), 0), 1)`,
      avgTimeSpent: sql<number>`round(coalesce(avg(${viewHistory.secondsSpent}), 0), 1)`,
    })
    .from(viewHistory)
    .innerJoin(posts, eq(viewHistory.postId, posts.id))
    .where(
      actorHasAnyClaim(actor, [AUTHORIZATION_CLAIM.analyticsReadAny])
        ? undefined
        : eq(posts.authorId, actor.userId ?? ""),
    );

  return {
    totalViews: metricsResult?.totalViews ?? 0,
    avgScrollRate: metricsResult?.avgScrollRate ?? 0,
    avgTimeSpent: metricsResult?.avgTimeSpent ?? 0,
  };
}

export async function getOverallDailyViews(
  db: AppDb,
  actor: AuthorizationActor,
): Promise<ViewsDataPoint[]> {
  return db
    .select({
      date: sql<string>`strftime('%Y-%m-%d', datetime(${viewHistory.createdAt} / 1000, 'unixepoch'))`,
      count: sql<number>`count(${viewHistory.id})`,
    })
    .from(viewHistory)
    .innerJoin(posts, eq(viewHistory.postId, posts.id))
    .where(
      and(
        actorHasAnyClaim(actor, [AUTHORIZATION_CLAIM.analyticsReadAny])
          ? undefined
          : eq(posts.authorId, actor.userId ?? ""),
        sql`${viewHistory.createdAt} >= ${Date.now() - 30 * 24 * 60 * 60 * 1000}`,
      ),
    )
    .groupBy(
      sql`strftime('%Y-%m-%d', datetime(${viewHistory.createdAt} / 1000, 'unixepoch'))`,
    )
    .orderBy(
      sql`strftime('%Y-%m-%d', datetime(${viewHistory.createdAt} / 1000, 'unixepoch')) asc`,
    );
}

export async function getOverallMonthlyViews(
  db: AppDb,
  actor: AuthorizationActor,
): Promise<MonthlyViewsDataPoint[]> {
  return db
    .select({
      month: sql<string>`strftime('%Y-%m', datetime(${viewHistory.createdAt} / 1000, 'unixepoch'))`,
      count: sql<number>`count(${viewHistory.id})`,
    })
    .from(viewHistory)
    .innerJoin(posts, eq(viewHistory.postId, posts.id))
    .where(
      and(
        actorHasAnyClaim(actor, [AUTHORIZATION_CLAIM.analyticsReadAny])
          ? undefined
          : eq(posts.authorId, actor.userId ?? ""),
        sql`${viewHistory.createdAt} >= ${Date.now() - 365 * 24 * 60 * 60 * 1000}`,
      ),
    )
    .groupBy(
      sql`strftime('%Y-%m', datetime(${viewHistory.createdAt} / 1000, 'unixepoch'))`,
    )
    .orderBy(
      sql`strftime('%Y-%m', datetime(${viewHistory.createdAt} / 1000, 'unixepoch')) asc`,
    );
}

export async function listPostsAnalyticsPage(
  db: AppDb,
  actor: AuthorizationActor,
  options: {
    cursor?: DashboardAnalyticsCursor | null;
    direction?: "next" | "previous";
    pageSize: number;
    searchQuery?: string;
  },
): Promise<DashboardAnalyticsPage> {
  const direction = options.direction ?? "next";
  const limitValue = options.pageSize + 1;

  const sq = db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      authorId: posts.authorId,
      updatedAt: posts.updatedAt,
      createdAt: posts.createdAt,
      viewsCount: sql<number>`count(${viewHistory.id})`.as("viewsCount"),
      avgScrollRate:
        sql<number>`round(coalesce(avg(${viewHistory.scrollRate}), 0), 1)`.as(
          "avgScrollRate",
        ),
      avgSecondsSpent:
        sql<number>`round(coalesce(avg(${viewHistory.secondsSpent}), 0), 1)`.as(
          "avgSecondsSpent",
        ),
    })
    .from(posts)
    .leftJoin(viewHistory, eq(posts.id, viewHistory.postId))
    .where(
      and(
        actorHasAnyClaim(actor, [AUTHORIZATION_CLAIM.analyticsReadAny])
          ? undefined
          : eq(posts.authorId, actor.userId ?? ""),
        options.searchQuery
          ? or(
              like(posts.title, `%${options.searchQuery}%`),
              like(posts.slug, `%${options.searchQuery}%`),
            )
          : undefined,
      ),
    )
    .groupBy(posts.id)
    .as("sq");

  let baseQuery = db.select().from(sq).$dynamic();

  if (options.cursor) {
    const cursor = options.cursor;
    const cond =
      direction === "previous"
        ? or(
            gt(sq.viewsCount, cursor.viewsCount),
            and(
              eq(sq.viewsCount, cursor.viewsCount),
              gt(sq.updatedAt, new Date(cursor.updatedAt)),
            ),
            and(
              eq(sq.viewsCount, cursor.viewsCount),
              eq(sq.updatedAt, new Date(cursor.updatedAt)),
              gt(sq.createdAt, new Date(cursor.createdAt)),
            ),
            and(
              eq(sq.viewsCount, cursor.viewsCount),
              eq(sq.updatedAt, new Date(cursor.updatedAt)),
              eq(sq.createdAt, new Date(cursor.createdAt)),
              lt(sq.slug, cursor.slug),
            ),
          )
        : or(
            lt(sq.viewsCount, cursor.viewsCount),
            and(
              eq(sq.viewsCount, cursor.viewsCount),
              lt(sq.updatedAt, new Date(cursor.updatedAt)),
            ),
            and(
              eq(sq.viewsCount, cursor.viewsCount),
              eq(sq.updatedAt, new Date(cursor.updatedAt)),
              lt(sq.createdAt, new Date(cursor.createdAt)),
            ),
            and(
              eq(sq.viewsCount, cursor.viewsCount),
              eq(sq.updatedAt, new Date(cursor.updatedAt)),
              eq(sq.createdAt, new Date(cursor.createdAt)),
              gt(sq.slug, cursor.slug),
            ),
          );
    baseQuery = baseQuery.where(cond);
  }

  const orderedRows = await baseQuery
    .orderBy(
      direction === "previous" ? asc(sq.viewsCount) : desc(sq.viewsCount),
      direction === "previous" ? asc(sq.updatedAt) : desc(sq.updatedAt),
      direction === "previous" ? asc(sq.createdAt) : desc(sq.createdAt),
      direction === "previous" ? desc(sq.slug) : asc(sq.slug),
    )
    .limit(limitValue);

  const visibleRows = orderedRows.slice(0, options.pageSize);
  const items = direction === "previous" ? [...visibleRows].reverse() : visibleRows;

  const firstItem = items[0];
  const lastItem = items.at(-1);
  const hasExtraRow = orderedRows.length > options.pageSize;
  const hasNextPage = direction === "previous" ? Boolean(options.cursor) : hasExtraRow;
  const hasPreviousPage =
    direction === "previous" ? hasExtraRow : Boolean(options.cursor);

  return {
    items: items.map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      authorId: row.authorId,
      viewsCount: Number(row.viewsCount),
      avgScrollRate: Number(row.avgScrollRate),
      avgSecondsSpent: Number(row.avgSecondsSpent),
    })),
    pagination: {
      hasNextPage,
      hasPreviousPage,
      nextCursor:
        hasNextPage && lastItem
          ? buildDashboardAnalyticsCursor({
              viewsCount: Number(lastItem.viewsCount),
              updatedAt: new Date(lastItem.updatedAt).getTime(),
              createdAt: new Date(lastItem.createdAt).getTime(),
              slug: lastItem.slug,
            })
          : null,
      previousCursor:
        hasPreviousPage && firstItem
          ? buildDashboardAnalyticsCursor({
              viewsCount: Number(firstItem.viewsCount),
              updatedAt: new Date(firstItem.updatedAt).getTime(),
              createdAt: new Date(firstItem.createdAt).getTime(),
              slug: firstItem.slug,
            })
          : null,
    },
  };
}
