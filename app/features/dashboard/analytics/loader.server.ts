import type { AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../db/context";
import {
  actorHasAnyClaim,
  assertAuthorized,
  withDashboardAccess,
} from "~/shared/authz/authz.server";
import { AUTHORIZATION_CLAIM } from "~/shared/authz/model";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";

import {
  getPostAnalyticsDetails,
  getOverallAnalyticsMetrics,
  getOverallDailyViews,
  getOverallMonthlyViews,
  listPostsAnalyticsPage,
  parseDashboardAnalyticsCursor,
} from "~/lib/analytics/analytics.server";

import {
  DASHBOARD_ANALYTICS_QUERY_PARAM,
  buildDashboardAnalyticsFilters,
  buildDashboardAnalyticsViewState,
  buildDeniedDashboardAnalyticsLoaderData,
  buildDashboardAnalyticsPaginationState,
  DASHBOARD_ANALYTICS_PAGE_SIZE,
  type DashboardAnalyticsLoaderData,
  type ViewsDataPoint,
  type MonthlyViewsDataPoint,
} from "./state";

export async function loadDashboardAnalyticsData(
  context: AppLoadContext,
  request: Request,
): Promise<DashboardAnalyticsLoaderData | Response> {
  return withDashboardAccess({
    request,
    context,
    authorize: ({ actor }) =>
      assertAuthorized<DashboardAnalyticsLoaderData>({
        error: {
          action: APP_ERROR_ACTION.read,
          code: APP_ERROR_CODE.analytics.read.forbidden,
          message: "Analytics dashboard access denied",
          resource: APP_ERROR_RESOURCE.analytics,
          responseData: buildDeniedDashboardAnalyticsLoaderData(),
          status: 403,
        },
        isAllowed: actorHasAnyClaim(actor, [
          AUTHORIZATION_CLAIM.analyticsReadAny,
          AUTHORIZATION_CLAIM.analyticsReadOwn,
        ]),
      }),
    handle: async ({ actor }) => {
      const db = getDbFromContext(context);
      const url = new URL(request.url);
      const viewState = buildDashboardAnalyticsViewState(url);
      const filters = buildDashboardAnalyticsFilters(viewState);

      const viewPostId = url.searchParams.get(DASHBOARD_ANALYTICS_QUERY_PARAM.view);
      let postDailyViews: ViewsDataPoint[] = [];
      let postMonthlyViews: MonthlyViewsDataPoint[] = [];
      let selectedPostTitle = "";
      let isModalOpen = false;

      if (viewPostId) {
        const details = await getPostAnalyticsDetails(db, viewPostId, actor);
        if (details) {
          selectedPostTitle = details.title;
          isModalOpen = true;
          postDailyViews = details.dailyViews;
          postMonthlyViews = details.monthlyViews;
        }
      }

      const metrics = await getOverallAnalyticsMetrics(db, actor);
      const dailyViews = await getOverallDailyViews(db, actor);
      const monthlyViews = await getOverallMonthlyViews(db, actor);

      const parsedCursor = parseDashboardAnalyticsCursor(viewState.cursor);
      const postsPage = await listPostsAnalyticsPage(db, actor, {
        cursor: parsedCursor,
        direction: viewState.direction,
        pageSize: DASHBOARD_ANALYTICS_PAGE_SIZE,
        searchQuery: filters.searchQuery,
      });

      const pagination = buildDashboardAnalyticsPaginationState({
        currentCursor: viewState.cursor,
        direction: viewState.direction,
        hasNextPage: postsPage.pagination.hasNextPage,
        hasPreviousPage: postsPage.pagination.hasPreviousPage,
        nextCursor: postsPage.pagination.nextCursor,
        previousCursor: postsPage.pagination.previousCursor,
        pageSize: DASHBOARD_ANALYTICS_PAGE_SIZE,
      });

      return {
        access: "granted",
        filters,
        metrics,
        pagination,
        dailyViews,
        monthlyViews,
        posts: postsPage.items,
        permissions: {
          canReadAny: actorHasAnyClaim(actor, [AUTHORIZATION_CLAIM.analyticsReadAny]),
          canReadOwn: actorHasAnyClaim(actor, [AUTHORIZATION_CLAIM.analyticsReadOwn]),
        },
        form: {
          viewId: viewPostId,
          isOpen: isModalOpen,
          selectedPostTitle,
          postDailyViews,
          postMonthlyViews,
        },
      };
    },
  });
}
