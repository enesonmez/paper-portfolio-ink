import type { AppLoadContext } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getPostAnalyticsDetailsMock,
  getOverallAnalyticsMetricsMock,
  getOverallDailyViewsMock,
  getOverallMonthlyViewsMock,
  listPostsAnalyticsPageMock,
  parseDashboardAnalyticsCursorMock,
  requireSessionMock,
} = vi.hoisted(() => {
  return {
    getPostAnalyticsDetailsMock: vi.fn(),
    getOverallAnalyticsMetricsMock: vi.fn(),
    getOverallDailyViewsMock: vi.fn(),
    getOverallMonthlyViewsMock: vi.fn(),
    listPostsAnalyticsPageMock: vi.fn(),
    parseDashboardAnalyticsCursorMock: vi.fn(),
    requireSessionMock: vi.fn(),
  };
});

vi.mock("~/lib/analytics/analytics.server", () => {
  return {
    getPostAnalyticsDetails: getPostAnalyticsDetailsMock,
    getOverallAnalyticsMetrics: getOverallAnalyticsMetricsMock,
    getOverallDailyViews: getOverallDailyViewsMock,
    getOverallMonthlyViews: getOverallMonthlyViewsMock,
    listPostsAnalyticsPage: listPostsAnalyticsPageMock,
    parseDashboardAnalyticsCursor: parseDashboardAnalyticsCursorMock,
  };
});

vi.mock("~/shared/auth/session.server", () => {
  return {
    requireSession: requireSessionMock,
  };
});

describe("dashboard analytics server and loader integration", () => {
  const context = {
    db: { query: {} } as never,
    runtime: { platform: "node" },
  } as unknown as AppLoadContext;

  beforeEach(() => {
    getPostAnalyticsDetailsMock.mockReset();
    getOverallAnalyticsMetricsMock.mockReset();
    getOverallDailyViewsMock.mockReset();
    getOverallMonthlyViewsMock.mockReset();
    listPostsAnalyticsPageMock.mockReset();
    parseDashboardAnalyticsCursorMock.mockReset();
    requireSessionMock.mockReset();
    parseDashboardAnalyticsCursorMock.mockReturnValue(null);
  });

  it("loads the analytics dashboard registry for admin sessions", async () => {
    const { loadDashboardAnalyticsData } =
      await import("~/features/dashboard/analytics/loader.server");

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-admin",
        role: "admin",
      },
    });

    getOverallAnalyticsMetricsMock.mockResolvedValue({
      totalViews: 120,
      avgScrollRate: 67.5,
      avgTimeSpent: 124.2,
    });

    getOverallDailyViewsMock.mockResolvedValue([{ date: "2026-05-27", count: 12 }]);

    getOverallMonthlyViewsMock.mockResolvedValue([{ month: "2026-05", count: 120 }]);

    listPostsAnalyticsPageMock.mockResolvedValue({
      items: [
        {
          id: "post-1",
          title: "Edge Field Notes",
          slug: "edge-notes",
          authorId: "user-admin",
          viewsCount: 120,
          avgScrollRate: 67.5,
          avgSecondsSpent: 124,
        },
      ],
      pagination: {
        hasNextPage: false,
        hasPreviousPage: false,
        nextCursor: null,
        previousCursor: null,
      },
    });

    const response = await loadDashboardAnalyticsData(
      context,
      new Request("http://localhost:3000/dashboard/analytics"),
    );

    if (response instanceof Response || response.access !== "granted") {
      throw new Error("Expected granted analytics loader data");
    }

    expect(response).toMatchObject({
      access: "granted",
      metrics: {
        totalViews: 120,
        avgScrollRate: 67.5,
        avgTimeSpent: 124.2,
      },
      posts: [
        {
          id: "post-1",
          viewsCount: 120,
        },
      ],
    });
  });

  it("denies access to non-admin and non-author users", async () => {
    const { loadDashboardAnalyticsData } =
      await import("~/features/dashboard/analytics/loader.server");

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-revoked",
        role: "guest",
      },
    });

    await expect(
      loadDashboardAnalyticsData(
        context,
        new Request("http://localhost:3000/dashboard/analytics"),
      ),
    ).rejects.toMatchObject({
      code: "analytics.read.forbidden",
      status: 403,
    });
  });
});
