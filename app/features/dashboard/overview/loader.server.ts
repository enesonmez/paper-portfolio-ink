import type { AppLoadContext } from "react-router";
import { getDbFromContext } from "../../../../db/context";
import {
  actorHasAnyClaim,
  assertAuthorized,
  withDashboardAccess,
} from "~/shared/authz/authz.server";
import { AUTHORIZATION_CLAIM } from "~/shared/authz/model";
import {
  getOverviewRecentLogs,
  getOverviewRecentPosts,
  getOverviewStats,
} from "~/lib/overview/overview.server";
import {
  getOverallDailyViews,
  getOverallMonthlyViews,
} from "~/lib/analytics/analytics.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";

export async function loadDashboardOverviewData(
  context: AppLoadContext,
  request: Request,
) {
  return withDashboardAccess({
    request,
    context,
    authorize: ({ actor }) =>
      assertAuthorized({
        error: {
          action: APP_ERROR_ACTION.read,
          code: APP_ERROR_CODE.dashboard.read.forbidden,
          message: "Dashboard access denied",
          resource: APP_ERROR_RESOURCE.dashboard,
          status: 403,
        },
        isAllowed: actorHasAnyClaim(actor, [AUTHORIZATION_CLAIM.dashboardAccess]),
      }),
    handle: async ({ actor }) => {
      const db = getDbFromContext(context);

      const [stats, recentLogs, recentPosts] = await Promise.all([
        getOverviewStats(db, actor),
        getOverviewRecentLogs(db, actor),
        getOverviewRecentPosts(db, actor),
      ]);

      const canReadAnalytics = actorHasAnyClaim(actor, [
        AUTHORIZATION_CLAIM.analyticsReadAny,
        AUTHORIZATION_CLAIM.analyticsReadOwn,
      ]);

      const [dailyViews, monthlyViews] = canReadAnalytics
        ? await Promise.all([
            getOverallDailyViews(db, actor),
            getOverallMonthlyViews(db, actor),
          ])
        : [[], []];

      return {
        stats,
        recentLogs: recentLogs.map((log) => ({
          id: log.id,
          action: log.action,
          resource: log.resource,
          result: log.result,
          message: log.message,
          createdAt: new Date(log.createdAt).getTime(),
        })),
        recentPosts: recentPosts.map((post) => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          status: post.status,
          updatedAt: new Date(post.updatedAt).getTime(),
        })),
        analytics: {
          enabled: canReadAnalytics,
          dailyViews,
          monthlyViews,
        },
      };
    },
  });
}
