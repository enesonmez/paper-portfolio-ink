import {
  buildPublicBlogFeedHref,
  mergePublicBlogPosts,
  normalizePublicBlogPage,
} from "../../app/features/public/blog/public-blog.shared";

describe("public blog shared helpers", () => {
  it("normalizes invalid page values to 1", () => {
    expect(normalizePublicBlogPage(null)).toBe(1);
    expect(normalizePublicBlogPage("0")).toBe(1);
    expect(normalizePublicBlogPage("-5")).toBe(1);
    expect(normalizePublicBlogPage("abc")).toBe(1);
  });

  it("builds the feed href using the page query parameter", () => {
    expect(buildPublicBlogFeedHref(3)).toBe("/blog/feed?page=3");
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
