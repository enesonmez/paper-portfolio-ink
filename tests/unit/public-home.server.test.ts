import type { AppLoadContext } from "react-router";
import { describe, expect, it, vi } from "vitest";

const { listPublicFeaturedProjectsMock, listPublicSkillsMock } = vi.hoisted(() => ({
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
  it("loads featured projects and skills from the database context", async () => {
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
    const skills = [
      {
        iconKey: "workflow" as const,
        name: "React Router",
        sortOrder: 0,
        summary: "Typed routing, loader/action data flows, and SSR-first delivery.",
      },
    ];

    listPublicFeaturedProjectsMock.mockResolvedValue(featuredProjects);
    listPublicSkillsMock.mockResolvedValue(skills);

    const { loadPublicHomeData } =
      await import("../../app/features/public/home/public-home.server");

    await expect(
      loadPublicHomeData({ db } as unknown as AppLoadContext),
    ).resolves.toEqual({
      featuredProjects,
      skills,
    });

    expect(listPublicFeaturedProjectsMock).toHaveBeenCalledWith(db);
    expect(listPublicSkillsMock).toHaveBeenCalledWith(db);
  });
});
