import { describe, expect, it } from "vitest";

import {
  buildPublicBlogCacheKey,
  publicBlogDataSchema,
} from "~/features/public/blog/data/cache";

describe("public blog cache helpers", () => {
  it("builds a stable first-page cache key", () => {
    expect(
      buildPublicBlogCacheKey(
        new Request("https://paper-portfolio-ink.dev/tr/blog?cursor=test"),
      ),
    ).toBe("https://paper-portfolio-ink.dev/__cache/public/blog/page-1");
  });

  it("validates cached public blog payloads", () => {
    expect(
      publicBlogDataSchema.parse({
        nextCursor: null,
        posts: [
          {
            authorName: "Enes Sonmez",
            coverImageUrl: null,
            excerpt: "Edge notes.",
            publishedAtIso: "2026-03-21T10:00:00.000Z",
            publishedAtLabel: "21 Mar 2026",
            readingTimeMinutes: 4,
            slug: "edge-notes",
            title: "Edge notes",
          },
        ],
      }),
    ).toMatchObject({
      posts: [
        {
          slug: "edge-notes",
        },
      ],
    });
  });
});
