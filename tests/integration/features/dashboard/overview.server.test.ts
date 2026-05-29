import type { AppLoadContext } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getOverviewStatsMock,
  getOverviewRecentLogsMock,
  getOverviewRecentPostsMock,
  getOverallDailyViewsMock,
  getOverallMonthlyViewsMock,
  requireSessionMock,
} = vi.hoisted(() => {
  return {
    getOverviewStatsMock: vi.fn(),
    getOverviewRecentLogsMock: vi.fn(),
    getOverviewRecentPostsMock: vi.fn(),
    getOverallDailyViewsMock: vi.fn(),
    getOverallMonthlyViewsMock: vi.fn(),
    requireSessionMock: vi.fn(),
  };
});

vi.mock("~/lib/overview/overview.server", () => {
  return {
    getOverviewStats: getOverviewStatsMock,
    getOverviewRecentLogs: getOverviewRecentLogsMock,
    getOverviewRecentPosts: getOverviewRecentPostsMock,
  };
});

vi.mock("~/lib/analytics/analytics.server", () => {
  return {
    getOverallDailyViews: getOverallDailyViewsMock,
    getOverallMonthlyViews: getOverallMonthlyViewsMock,
  };
});

vi.mock("~/shared/auth/session.server", () => {
  return {
    requireSession: requireSessionMock,
  };
});

describe("dashboard overview server and loader integration", () => {
  const context = {
    db: { query: {} } as never,
    runtime: { platform: "node" },
  } as unknown as AppLoadContext;

  beforeEach(() => {
    getOverviewStatsMock.mockReset();
    getOverviewRecentLogsMock.mockReset();
    getOverviewRecentPostsMock.mockReset();
    getOverallDailyViewsMock.mockReset();
    getOverallMonthlyViewsMock.mockReset();
    requireSessionMock.mockReset();
  });

  it("loads full dynamic dashboard overview data for admin sessions", async () => {
    const { loadDashboardOverviewData } =
      await import("~/features/dashboard/overview/loader.server");

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-admin",
        role: "admin",
      },
    });

    getOverviewStatsMock.mockResolvedValue({
      postCount: 15,
      projectCount: 5,
      activeUserCount: 2,
      skillCount: 10,
    });

    getOverviewRecentLogsMock.mockResolvedValue([
      {
        id: "log-1",
        action: "create",
        resource: "posts",
        result: "success",
        message: "Created post: test-post",
        createdAt: new Date("2026-05-29T10:00:00Z"),
      },
    ]);

    getOverviewRecentPostsMock.mockResolvedValue([
      {
        id: "post-1",
        title: "Test Post",
        slug: "test-post",
        excerpt: "Test post description",
        status: "published",
        updatedAt: new Date("2026-05-29T10:00:00Z"),
      },
    ]);

    getOverallDailyViewsMock.mockResolvedValue([{ date: "2026-05-29", count: 100 }]);
    getOverallMonthlyViewsMock.mockResolvedValue([{ month: "2026-05", count: 1200 }]);

    const response = await loadDashboardOverviewData(
      context,
      new Request("http://localhost:3000/dashboard"),
    );

    if (response instanceof Response) {
      throw new Error("Expected loader data object, got Response");
    }

    expect(response).toMatchObject({
      stats: {
        postCount: 15,
        projectCount: 5,
        activeUserCount: 2,
        skillCount: 10,
      },
      recentLogs: [
        {
          id: "log-1",
          message: "Created post: test-post",
        },
      ],
      recentPosts: [
        {
          id: "post-1",
          title: "Test Post",
          status: "published",
        },
      ],
      analytics: {
        enabled: true,
        dailyViews: [{ date: "2026-05-29", count: 100 }],
        monthlyViews: [{ month: "2026-05", count: 1200 }],
      },
    });
  });

  it("loads scoped dashboard overview data for author sessions", async () => {
    const { loadDashboardOverviewData } =
      await import("~/features/dashboard/overview/loader.server");

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-author",
        role: "author",
      },
    });

    getOverviewStatsMock.mockResolvedValue({
      postCount: 3,
      projectCount: null,
      activeUserCount: null,
      skillCount: null,
    });

    getOverviewRecentLogsMock.mockResolvedValue([
      {
        id: "log-2",
        action: "update",
        resource: "posts",
        result: "success",
        message: "Updated own post",
        createdAt: new Date("2026-05-29T10:00:00Z"),
      },
    ]);

    getOverviewRecentPostsMock.mockResolvedValue([
      {
        id: "post-2",
        title: "Own Post",
        slug: "own-post",
        excerpt: "Own excerpt",
        status: "draft",
        updatedAt: new Date("2026-05-29T10:00:00Z"),
      },
    ]);

    getOverallDailyViewsMock.mockResolvedValue([{ date: "2026-05-29", count: 15 }]);
    getOverallMonthlyViewsMock.mockResolvedValue([{ month: "2026-05", count: 200 }]);

    const response = await loadDashboardOverviewData(
      context,
      new Request("http://localhost:3000/dashboard"),
    );

    if (response instanceof Response) {
      throw new Error("Expected loader data object, got Response");
    }

    expect(response).toMatchObject({
      stats: {
        postCount: 3,
        projectCount: null,
        activeUserCount: null,
        skillCount: null,
      },
      recentLogs: [
        {
          id: "log-2",
          message: "Updated own post",
        },
      ],
      recentPosts: [
        {
          id: "post-2",
          status: "draft",
        },
      ],
      analytics: {
        enabled: true,
        dailyViews: [{ date: "2026-05-29", count: 15 }],
        monthlyViews: [{ month: "2026-05", count: 200 }],
      },
    });
  });

  it("blocks guest user with 403 response", async () => {
    const { loadDashboardOverviewData } =
      await import("~/features/dashboard/overview/loader.server");

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-guest",
        role: "guest",
      },
    });

    await expect(
      loadDashboardOverviewData(
        context,
        new Request("http://localhost:3000/dashboard"),
      ),
    ).rejects.toMatchObject({
      status: 403,
    });
  });
});
