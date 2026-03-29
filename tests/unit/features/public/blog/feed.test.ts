import {
  buildPublicBlogFeedHref,
  mergePublicBlogPosts,
  parsePublicBlogCursor,
} from "~/features/public/blog/data/feed";

describe("public blog shared helpers", () => {
  it("returns null for missing or malformed cursors", () => {
    expect(parsePublicBlogCursor(null)).toBeNull();
    expect(parsePublicBlogCursor("not-json")).toBeNull();
    expect(
      parsePublicBlogCursor(JSON.stringify({ slug: "missing-fields" })),
    ).toBeNull();
  });

  it("builds the feed href using the cursor query parameter", () => {
    const cursor = JSON.stringify({
      createdAtIso: "2026-03-18T10:00:00.000Z",
      publishedAtIso: "2026-03-18T10:00:00.000Z",
      slug: "edge-observability-playbook",
      updatedAtIso: "2026-03-19T10:00:00.000Z",
    });

    expect(buildPublicBlogFeedHref(cursor)).toBe(
      `/blog/feed?cursor=${encodeURIComponent(cursor)}`,
    );
  });

  it("merges post pages without duplicating existing slugs", () => {
    expect(
      mergePublicBlogPosts(
        [
          {
            authorName: "Enes Sonmez",
            coverImageUrl: null,
            excerpt: "Summary",
            publishedAtIso: "2026-03-18T10:00:00.000Z",
            publishedAtLabel: "18 Mar 2026",
            readingTimeMinutes: 6,
            slug: "edge-observability-playbook",
            title: "Edge Observability Playbook",
          },
        ],
        [
          {
            authorName: "Enes Sonmez",
            coverImageUrl: null,
            excerpt: "Duplicate",
            publishedAtIso: "2026-03-17T10:00:00.000Z",
            publishedAtLabel: "17 Mar 2026",
            readingTimeMinutes: 4,
            slug: "edge-observability-playbook",
            title: "Edge Observability Playbook",
          },
          {
            authorName: "Enes Sonmez",
            coverImageUrl: null,
            excerpt: "Another note",
            publishedAtIso: "2026-03-16T10:00:00.000Z",
            publishedAtLabel: "16 Mar 2026",
            readingTimeMinutes: 5,
            slug: "cache-purge-window",
            title: "Cache Purge Window",
          },
        ],
      ),
    ).toHaveLength(2);
  });
});
