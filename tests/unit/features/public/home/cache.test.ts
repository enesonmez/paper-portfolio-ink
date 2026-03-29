import { describe, expect, it } from "vitest";

import {
  buildPublicHomeCacheKey,
  publicHomeDataSchema,
} from "~/features/public/home/data/cache";

describe("public home cache helpers", () => {
  it("builds a stable home payload cache key", () => {
    expect(
      buildPublicHomeCacheKey(new Request("https://paper-portfolio-ink.dev/tr")),
    ).toBe("https://paper-portfolio-ink.dev/__cache/public/home-data");
  });

  it("accepts valid cached featured projects and skills payloads", () => {
    expect(
      publicHomeDataSchema.parse({
        featuredProjects: [
          {
            createdAtLabel: "2026-03-21",
            description: null,
            liveUrl: "https://paper-portfolio-ink.dev",
            repositoryUrl: "https://github.com/enesonmez/paper-portfolio-ink",
            slug: "paper-portfolio-ink",
            summary: "Portfolio stack.",
            title: "Paper Enes Ink",
          },
        ],
        skills: [
          {
            iconKey: "workflow",
            name: "React Router",
            sortOrder: 0,
            summary: "Typed loader/action flows.",
          },
        ],
      }),
    ).toMatchObject({
      skills: [
        {
          iconKey: "workflow",
        },
      ],
    });
  });
});
