import type { AppLoadContext } from "react-router";
import { describe, expect, it, vi } from "vitest";

const { getPublicProjectsStatsMock, listPublicProjectsPageMock } = vi.hoisted(() => ({
  getPublicProjectsStatsMock: vi.fn(),
  listPublicProjectsPageMock: vi.fn(),
}));

vi.mock("~/lib/projects/projects.server", () => ({
  getPublicProjectsStats: getPublicProjectsStatsMock,
  listPublicProjectsPage: listPublicProjectsPageMock,
}));

describe("public projects server", () => {
  it("loads the initial projects page and global stats from the database", async () => {
    const db = { select: vi.fn() };
    const pageData = {
      items: [
        {
          coverImageUrl: null,
          createdAtLabel: "2026-03-18",
          description: null,
          isFeatured: true,
          liveUrl: "https://paper-enes-ink.dev",
          repositoryUrl: "https://github.com/enesonmez/paper-enes-ink",
          slug: "paper-enes-ink",
          summary: "Portfolio, blog, and dashboard stack tuned for Cloudflare.",
          title: "Paper Enes Ink",
        },
      ],
      nextPage: 2,
    };
    const stats = {
      featuredCount: 2,
      liveCount: 4,
      totalCount: 7,
    };

    listPublicProjectsPageMock.mockResolvedValue(pageData);
    getPublicProjectsStatsMock.mockResolvedValue(stats);

    const { loadPublicProjectsData } = await import(
      "../../app/features/public/projects/public-projects.server"
    );

    await expect(
      loadPublicProjectsData(
        { db } as unknown as AppLoadContext,
        new Request("https://paper-enes-ink.dev/projects?page=99"),
      ),
    ).resolves.toEqual({
      nextPage: 2,
      projects: pageData.items,
      stats,
    });

    expect(listPublicProjectsPageMock).toHaveBeenCalledWith(db, 6, 1);
    expect(getPublicProjectsStatsMock).toHaveBeenCalledWith(db);
  });

  it("loads feed pages independently for lazy scrolling", async () => {
    const db = { select: vi.fn() };
    const pageData = {
      items: [],
      nextPage: null,
    };

    listPublicProjectsPageMock.mockResolvedValue(pageData);

    const { loadPublicProjectsFeedData } = await import(
      "../../app/features/public/projects/public-projects.server"
    );

    await expect(
      loadPublicProjectsFeedData(
        { db } as unknown as AppLoadContext,
        new Request("https://paper-enes-ink.dev/projects/feed?page=3"),
      ),
    ).resolves.toEqual({
      page: 3,
      nextPage: null,
      projects: [],
    });

    expect(listPublicProjectsPageMock).toHaveBeenCalledWith(db, 6, 3);
  });
});
