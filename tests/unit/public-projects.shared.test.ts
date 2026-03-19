import {
  buildPublicProjectsFeedHref,
  mergePublicProjects,
  normalizePublicProjectsPage,
} from "../../app/features/public/projects/public-projects.shared";

describe("public projects shared helpers", () => {
  it("normalizes invalid page values to 1", () => {
    expect(normalizePublicProjectsPage(null)).toBe(1);
    expect(normalizePublicProjectsPage("0")).toBe(1);
    expect(normalizePublicProjectsPage("-5")).toBe(1);
    expect(normalizePublicProjectsPage("abc")).toBe(1);
  });

  it("builds the feed href using the page query parameter", () => {
    expect(buildPublicProjectsFeedHref(3)).toBe("/projects/feed?page=3");
  });

  it("merges project pages without duplicating existing slugs", () => {
    expect(
      mergePublicProjects(
        [
          {
            coverImageUrl: null,
            createdAtLabel: "2026-03-18",
            description: null,
            isFeatured: true,
            liveUrl: null,
            repositoryUrl: null,
            slug: "paper-portfolio-ink",
            summary: "Summary",
            title: "Paper Enes Ink",
          },
        ],
        [
          {
            coverImageUrl: null,
            createdAtLabel: "2026-03-17",
            description: null,
            isFeatured: false,
            liveUrl: null,
            repositoryUrl: null,
            slug: "paper-portfolio-ink",
            summary: "Duplicate summary",
            title: "Paper Enes Ink",
          },
          {
            coverImageUrl: null,
            createdAtLabel: "2026-03-16",
            description: null,
            isFeatured: false,
            liveUrl: "https://cyber.paper-portfolio-ink.dev",
            repositoryUrl: null,
            slug: "cyber-store-front",
            summary: "Another summary",
            title: "Cyber Store Front",
          },
        ],
      ),
    ).toHaveLength(2);
  });
});
