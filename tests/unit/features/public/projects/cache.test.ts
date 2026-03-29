import { describe, expect, it } from "vitest";

import {
  buildPublicProjectsCacheKey,
  publicProjectsDataSchema,
} from "~/features/public/projects/data/cache";

describe("public projects cache helpers", () => {
  it("builds a stable first-page projects cache key", () => {
    expect(
      buildPublicProjectsCacheKey(
        new Request("https://paper-portfolio-ink.dev/projects?cursor=test"),
      ),
    ).toBe("https://paper-portfolio-ink.dev/__cache/public/projects/page-1");
  });

  it("validates cached project list payloads", () => {
    expect(
      publicProjectsDataSchema.parse({
        nextCursor: null,
        projects: [
          {
            coverImageUrl: null,
            createdAtLabel: "2026-03-21",
            description: null,
            isFeatured: true,
            liveUrl: "https://paper-portfolio-ink.dev",
            repositoryUrl: "https://github.com/enesonmez/paper-portfolio-ink",
            slug: "paper-portfolio-ink",
            summary: "Portfolio stack.",
            title: "Paper Enes Ink",
          },
        ],
        stats: {
          featuredCount: 1,
          liveCount: 1,
          totalCount: 1,
        },
      }),
    ).toMatchObject({
      stats: {
        totalCount: 1,
      },
    });
  });
});
