import type { AppLoadContext } from "react-router";
import { describe, expect, it, vi } from "vitest";

const { listPublicFeaturedProjectsMock } = vi.hoisted(() => ({
  listPublicFeaturedProjectsMock: vi.fn(),
}));

vi.mock("~/lib/projects/projects.server", () => ({
  listPublicFeaturedProjects: listPublicFeaturedProjectsMock,
}));

describe("public home server", () => {
  it("loads featured projects from the database context", async () => {
    const db = { select: vi.fn() };
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

    listPublicFeaturedProjectsMock.mockResolvedValue(featuredProjects);

    const { loadPublicHomeData } = await import(
      "../../app/features/public/home/public-home.server"
    );

    await expect(
      loadPublicHomeData({ db } as unknown as AppLoadContext),
    ).resolves.toEqual({
      featuredProjects,
    });

    expect(listPublicFeaturedProjectsMock).toHaveBeenCalledWith(db);
  });
});
