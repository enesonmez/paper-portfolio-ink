import type { AppLoadContext } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  cacheDeleteMock,
  cacheGetMock,
  cacheSetMock,
  getPublicPostBySlugMock,
  listPublicCompanionPostsMock,
  listPublicPostsPageMock,
} = vi.hoisted(() => ({
  cacheDeleteMock: vi.fn(),
  cacheGetMock: vi.fn(),
  cacheSetMock: vi.fn(),
  getPublicPostBySlugMock: vi.fn(),
  listPublicCompanionPostsMock: vi.fn(),
  listPublicPostsPageMock: vi.fn(),
}));

vi.mock("~/lib/posts/posts.server", () => ({
  getPublicPostBySlug: getPublicPostBySlugMock,
  listPublicCompanionPosts: listPublicCompanionPostsMock,
  listPublicPostsPage: listPublicPostsPageMock,
}));

describe("public blog server", () => {
  const context = {
    cache: {
      delete: cacheDeleteMock,
      get: cacheGetMock,
      set: cacheSetMock,
    },
    db: { query: {} },
    runtime: { platform: "node" as const },
  } as unknown as AppLoadContext;

  beforeEach(() => {
    cacheDeleteMock.mockReset();
    cacheGetMock.mockReset();
    cacheSetMock.mockReset();
    getPublicPostBySlugMock.mockReset();
    listPublicCompanionPostsMock.mockReset();
    listPublicPostsPageMock.mockReset();
  });

  it("loads the first public blog page from the database context", async () => {
    cacheGetMock.mockResolvedValue(null);

    const pageData = {
      items: [
        {
          authorName: "Enes Sonmez",
          coverImageUrl: null,
          excerpt: "Edge cache invalidation notlari.",
          publishedAtIso: "2026-03-18T10:00:00.000Z",
          publishedAtLabel: "18 Mar 2026",
          readingTimeMinutes: 6,
          slug: "edge-observability-playbook",
          title: "Edge Observability Playbook",
        },
      ],
      nextCursor: JSON.stringify({
        createdAtIso: "2026-03-18T10:00:00.000Z",
        publishedAtIso: "2026-03-18T10:00:00.000Z",
        slug: "edge-observability-playbook",
        updatedAtIso: "2026-03-19T10:00:00.000Z",
      }),
    };

    listPublicPostsPageMock.mockResolvedValue(pageData);

    const { loadPublicBlogData } = await import("~/features/public/blog/server");

    await expect(
      loadPublicBlogData(
        context,
        new Request("https://paper-portfolio-ink.dev/blog?page=7"),
      ),
    ).resolves.toEqual({
      nextCursor: pageData.nextCursor,
      posts: pageData.items,
    });

    expect(listPublicPostsPageMock).toHaveBeenCalledWith(context.db, 5);
  });

  it("returns the cached first public blog page without touching the database", async () => {
    cacheGetMock.mockResolvedValue({
      nextCursor: JSON.stringify({
        createdAtIso: "2026-03-18T10:00:00.000Z",
        publishedAtIso: "2026-03-18T10:00:00.000Z",
        slug: "edge-observability-playbook",
        updatedAtIso: "2026-03-19T10:00:00.000Z",
      }),
      posts: [
        {
          authorName: "Enes Sonmez",
          coverImageUrl: null,
          excerpt: "Edge cache invalidation notlari.",
          publishedAtIso: "2026-03-18T10:00:00.000Z",
          publishedAtLabel: "18 Mar 2026",
          readingTimeMinutes: 6,
          slug: "edge-observability-playbook",
          title: "Edge Observability Playbook",
        },
      ],
    });

    const { loadPublicBlogData } = await import("~/features/public/blog/server");

    await expect(
      loadPublicBlogData(context, new Request("https://paper-portfolio-ink.dev/blog")),
    ).resolves.toEqual({
      nextCursor: JSON.stringify({
        createdAtIso: "2026-03-18T10:00:00.000Z",
        publishedAtIso: "2026-03-18T10:00:00.000Z",
        slug: "edge-observability-playbook",
        updatedAtIso: "2026-03-19T10:00:00.000Z",
      }),
      posts: [
        {
          authorName: "Enes Sonmez",
          coverImageUrl: null,
          excerpt: "Edge cache invalidation notlari.",
          publishedAtIso: "2026-03-18T10:00:00.000Z",
          publishedAtLabel: "18 Mar 2026",
          readingTimeMinutes: 6,
          slug: "edge-observability-playbook",
          title: "Edge Observability Playbook",
        },
      ],
    });

    expect(listPublicPostsPageMock).not.toHaveBeenCalled();
  });

  it("loads feed pages independently for lazy scrolling", async () => {
    const cursor = JSON.stringify({
      createdAtIso: "2026-03-12T10:00:00.000Z",
      publishedAtIso: "2026-03-12T10:00:00.000Z",
      slug: "zero-downtime-d1-migrations",
      updatedAtIso: "2026-03-12T11:00:00.000Z",
    });
    const pageData = {
      items: [
        {
          authorName: "Enes Sonmez",
          coverImageUrl: null,
          excerpt: "Cache purge timing note.",
          publishedAtIso: "2026-03-10T10:00:00.000Z",
          publishedAtLabel: "10 Mar 2026",
          readingTimeMinutes: 3,
          slug: "cache-purge-window",
          title: "Cache Purge Window",
        },
      ],
      nextCursor: null,
    };

    listPublicPostsPageMock.mockResolvedValue(pageData);

    const { loadPublicBlogFeedData } = await import("~/features/public/blog/server");

    await expect(
      loadPublicBlogFeedData(
        context,
        new Request(
          `https://paper-portfolio-ink.dev/blog/feed?cursor=${encodeURIComponent(cursor)}`,
        ),
      ),
    ).resolves.toEqual({
      cursor,
      nextCursor: null,
      posts: pageData.items,
    });

    expect(listPublicPostsPageMock).toHaveBeenCalledWith(context.db, 5, {
      createdAt: new Date("2026-03-12T10:00:00.000Z"),
      publishedAt: new Date("2026-03-12T10:00:00.000Z"),
      slug: "zero-downtime-d1-migrations",
      updatedAt: new Date("2026-03-12T11:00:00.000Z"),
    });
  });

  it("loads a public blog post and companion notes", async () => {
    const selectedPost = {
      authorBio: null,
      authorName: "Enes Sonmez",
      content: '{"type":"doc","content":[]}',
      coverImageUrl: null,
      excerpt: "Deploy akisi ve telemetry notlari.",
      publishedAtIso: "2026-03-18T10:00:00.000Z",
      publishedAtLabel: "18 Mar 2026",
      readingTimeMinutes: 6,
      slug: "edge-observability-playbook",
      title: "Edge Observability Playbook",
      updatedAtIso: "2026-03-19T10:00:00.000Z",
      updatedAtLabel: "19 Mar 2026",
    };
    const posts = [
      {
        authorName: "Enes Sonmez",
        coverImageUrl: null,
        excerpt: "D1 migration ritmi.",
        publishedAtIso: "2026-03-12T10:00:00.000Z",
        publishedAtLabel: "12 Mar 2026",
        readingTimeMinutes: 4,
        slug: "zero-downtime-d1-migrations",
        title: "Zero Downtime D1 Migrations",
      },
    ];

    getPublicPostBySlugMock.mockResolvedValue(selectedPost);
    listPublicCompanionPostsMock.mockResolvedValue(posts);

    const { loadPublicBlogPostData } = await import("~/features/public/blog/server");

    await expect(
      loadPublicBlogPostData(context, "edge-observability-playbook"),
    ).resolves.toEqual({
      morePosts: posts,
      post: selectedPost,
    });

    expect(listPublicCompanionPostsMock).toHaveBeenCalledWith(
      context.db,
      "edge-observability-playbook",
      3,
    );
  });

  it("throws a 404 response when the slug does not resolve to a published post", async () => {
    getPublicPostBySlugMock.mockResolvedValue(null);

    const { loadPublicBlogPostData } = await import("~/features/public/blog/server");

    await expect(
      loadPublicBlogPostData(context, "missing-story"),
    ).rejects.toMatchObject({
      message: "Published blog post not found.",
      name: "PublicBlogPostNotFoundError",
      status: 404,
    });
  });

  it("purges the first blog page cache with a stable key", async () => {
    cacheDeleteMock.mockResolvedValue(true);

    const { purgePublicBlogDataCache } = await import("~/features/public/blog/server");

    await purgePublicBlogDataCache(
      context,
      new Request("https://paper-portfolio-ink.dev/dashboard/posts"),
    );

    expect(cacheDeleteMock).toHaveBeenCalledWith(
      "https://paper-portfolio-ink.dev/__cache/public/blog/page-1",
    );
  });
});
