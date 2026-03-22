import type { AppLoadContext } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  cacheDeleteMock,
  cacheGetMock,
  cacheSetMock,
  listPublicFeaturedProjectsMock,
  listPublicSkillsMock,
} = vi.hoisted(() => ({
  cacheDeleteMock: vi.fn(),
  cacheGetMock: vi.fn(),
  cacheSetMock: vi.fn(),
  listPublicFeaturedProjectsMock: vi.fn(),
  listPublicSkillsMock: vi.fn(),
}));

vi.mock("~/lib/projects/projects.server", () => ({
  listPublicFeaturedProjects: listPublicFeaturedProjectsMock,
}));

vi.mock("~/lib/skills/skills.server", () => ({
  listPublicSkills: listPublicSkillsMock,
}));

describe("public home server", () => {
  const db = { select: vi.fn() };
  const request = new Request("https://paper-portfolio-ink.dev/");
  const featuredProjects = [
    {
      createdAtLabel: "2026-03-18",
      description: null,
      liveUrl: "https://paper-portfolio-ink.dev",
      repositoryUrl: "https://github.com/enesonmez/paper-portfolio-ink",
      slug: "paper-portfolio-ink",
      summary: "Portfolio, blog, and dashboard stack tuned for Cloudflare.",
      title: "Paper Enes Ink",
    },
  ];
  const skills = [
    {
      iconKey: "workflow" as const,
      name: "React Router",
      sortOrder: 0,
      summary: "Typed routing, loader/action data flows, and SSR-first delivery.",
    },
  ];
  const context = {
    cache: {
      delete: cacheDeleteMock,
      get: cacheGetMock,
      set: cacheSetMock,
    },
    db,
    runtime: { platform: "node" as const },
  } as unknown as AppLoadContext;

  beforeEach(() => {
    cacheDeleteMock.mockReset();
    cacheGetMock.mockReset();
    cacheSetMock.mockReset();
    listPublicFeaturedProjectsMock.mockReset();
    listPublicSkillsMock.mockReset();
  });

  it("loads featured projects and skills from the database context on cache miss", async () => {
    cacheGetMock.mockResolvedValue(null);

    listPublicFeaturedProjectsMock.mockResolvedValue(featuredProjects);
    listPublicSkillsMock.mockResolvedValue(skills);

    const { loadPublicHomeData } = await import("~/features/public/home/server");

    await expect(loadPublicHomeData(context, request)).resolves.toEqual({
      featuredProjects,
      skills,
    });

    expect(cacheSetMock).toHaveBeenCalledWith(
      "https://paper-portfolio-ink.dev/__cache/public/home-data",
      {
        featuredProjects,
        skills,
      },
      expect.objectContaining({
        maxAgeSeconds: 900,
      }),
    );
    expect(listPublicFeaturedProjectsMock).toHaveBeenCalledWith(db);
    expect(listPublicSkillsMock).toHaveBeenCalledWith(db);
  });

  it("returns the cached home payload without touching the database", async () => {
    cacheGetMock.mockResolvedValue({
      featuredProjects,
      skills,
    });

    const { loadPublicHomeData } = await import("~/features/public/home/server");

    await expect(loadPublicHomeData(context, request)).resolves.toEqual({
      featuredProjects,
      skills,
    });

    expect(cacheSetMock).not.toHaveBeenCalled();
    expect(listPublicFeaturedProjectsMock).not.toHaveBeenCalled();
    expect(listPublicSkillsMock).not.toHaveBeenCalled();
  });

  it("purges the home cache with a stable internal key", async () => {
    cacheDeleteMock.mockResolvedValue(true);

    const { purgePublicHomeDataCache } = await import("~/features/public/home/server");

    await purgePublicHomeDataCache(
      context,
      new Request("https://paper-portfolio-ink.dev/dashboard/skills"),
    );

    expect(cacheDeleteMock).toHaveBeenCalledWith(
      "https://paper-portfolio-ink.dev/__cache/public/home-data",
    );
  });
});
