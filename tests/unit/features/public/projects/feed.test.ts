import {
  buildPublicProjectsFeedHref,
  mergePublicProjects,
  parsePublicProjectsCursor,
} from "~/features/public/projects/data/feed";

describe("public projects shared helpers", () => {
  it("returns null for missing or malformed cursors", () => {
    expect(parsePublicProjectsCursor(null)).toBeNull();
    expect(parsePublicProjectsCursor("not-json")).toBeNull();
    expect(
      parsePublicProjectsCursor(JSON.stringify({ slug: "missing-fields" })),
    ).toBeNull();
  });

  it("builds the feed href using the cursor query parameter", () => {
    const cursor = JSON.stringify({
      createdAtIso: "2026-03-18T10:00:00.000Z",
      isFeatured: true,
      slug: "paper-portfolio-ink",
      sortOrder: 1,
    });

    expect(buildPublicProjectsFeedHref(cursor)).toBe(
      `/projects/feed?cursor=${encodeURIComponent(cursor)}`,
    );
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
