import type { AppLoadContext } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  cacheDeleteMock,
  cacheGetMock,
  cacheSetMock,
  getPublicProjectsStatsMock,
  listPublicProjectsPageMock,
} = vi.hoisted(() => ({
  cacheDeleteMock: vi.fn(),
  cacheGetMock: vi.fn(),
  cacheSetMock: vi.fn(),
  getPublicProjectsStatsMock: vi.fn(),
  listPublicProjectsPageMock: vi.fn(),
}));

vi.mock("~/lib/projects/projects.server", () => ({
  getPublicProjectsStats: getPublicProjectsStatsMock,
  listPublicProjectsPage: listPublicProjectsPageMock,
}));

describe("public projects server", () => {
  const db = { select: vi.fn() };
  const context = {
    cache: {
      delete: cacheDeleteMock,
      get: cacheGetMock,
      set: cacheSetMock,
    },
    db,
    runtime: { platform: "node" as const },
  } as unknown as AppLoadContext;
  const pageData = {
    items: [
      {
        coverImageUrl: null,
        createdAtLabel: "2026-03-18",
        description: null,
        isFeatured: true,
        liveUrl: "https://paper-portfolio-ink.dev",
        repositoryUrl: "https://github.com/enesonmez/paper-portfolio-ink",
        slug: "paper-portfolio-ink",
        summary: "Portfolio, blog, and dashboard stack tuned for Cloudflare.",
        title: "Paper Enes Ink",
      },
    ],
    nextCursor: JSON.stringify({
      createdAtIso: "2026-03-18T10:00:00.000Z",
      isFeatured: true,
      slug: "paper-portfolio-ink",
      sortOrder: 0,
    }),
  };
  const stats = {
    featuredCount: 2,
    liveCount: 4,
    totalCount: 7,
  };

  beforeEach(() => {
    cacheDeleteMock.mockReset();
    cacheGetMock.mockReset();
    cacheSetMock.mockReset();
    getPublicProjectsStatsMock.mockReset();
    listPublicProjectsPageMock.mockReset();
  });

  it("loads the initial projects page and global stats from the database", async () => {
    cacheGetMock.mockResolvedValue(null);

    listPublicProjectsPageMock.mockResolvedValue(pageData);
    getPublicProjectsStatsMock.mockResolvedValue(stats);

    const { loadPublicProjectsData } =
      await import("../../app/features/public/projects/server");

    await expect(
      loadPublicProjectsData(
        context,
        new Request("https://paper-portfolio-ink.dev/projects?page=99"),
      ),
    ).resolves.toEqual({
      nextCursor: pageData.nextCursor,
      projects: pageData.items,
      stats,
    });

    expect(listPublicProjectsPageMock).toHaveBeenCalledWith(db, 6);
    expect(getPublicProjectsStatsMock).toHaveBeenCalledWith(db);
  });

  it("returns the cached first projects page when available", async () => {
    cacheGetMock.mockResolvedValue({
      nextCursor: pageData.nextCursor,
      projects: pageData.items,
      stats,
    });

    const { loadPublicProjectsData } =
      await import("../../app/features/public/projects/server");

    await expect(
      loadPublicProjectsData(
        context,
        new Request("https://paper-portfolio-ink.dev/projects"),
      ),
    ).resolves.toEqual({
      nextCursor: pageData.nextCursor,
      projects: pageData.items,
      stats,
    });

    expect(listPublicProjectsPageMock).not.toHaveBeenCalled();
    expect(getPublicProjectsStatsMock).not.toHaveBeenCalled();
  });

  it("loads feed pages independently for lazy scrolling", async () => {
    const cursor = JSON.stringify({
      createdAtIso: "2026-03-12T10:00:00.000Z",
      isFeatured: false,
      slug: "previous-project",
      sortOrder: 4,
    });
    const pageData = {
      items: [],
      nextCursor: null,
    };

    listPublicProjectsPageMock.mockResolvedValue(pageData);

    const { loadPublicProjectsFeedData } =
      await import("../../app/features/public/projects/server");

    await expect(
      loadPublicProjectsFeedData(
        { db } as unknown as AppLoadContext,
        new Request(
          `https://paper-portfolio-ink.dev/projects/feed?cursor=${encodeURIComponent(cursor)}`,
        ),
      ),
    ).resolves.toEqual({
      cursor,
      nextCursor: null,
      projects: [],
    });

    expect(listPublicProjectsPageMock).toHaveBeenCalledWith(db, 6, {
      createdAt: new Date("2026-03-12T10:00:00.000Z"),
      isFeatured: false,
      slug: "previous-project",
      sortOrder: 4,
    });
  });

  it("purges the first projects page cache with a stable key", async () => {
    cacheDeleteMock.mockResolvedValue(true);

    const { purgePublicProjectsDataCache } =
      await import("../../app/features/public/projects/server");

    await purgePublicProjectsDataCache(
      context,
      new Request("https://paper-portfolio-ink.dev/dashboard/projects"),
    );

    expect(cacheDeleteMock).toHaveBeenCalledWith(
      "https://paper-portfolio-ink.dev/__cache/public/projects/page-1",
    );
  });
});
