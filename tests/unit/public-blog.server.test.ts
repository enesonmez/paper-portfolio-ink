import type { AppLoadContext } from "react-router";
import { describe, expect, it, vi } from "vitest";

const {
  getPublicPostBySlugMock,
  listPublicCompanionPostsMock,
  listPublicPostsPageMock,
} = vi.hoisted(() => ({
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
  const context = { db: { query: {} } } as unknown as AppLoadContext;

  it("loads the first public blog page from the database context", async () => {
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
      nextPage: 2,
    };

    listPublicPostsPageMock.mockResolvedValue(pageData);

    const { loadPublicBlogData } =
      await import("../../app/features/public/blog/public-blog.server");

    await expect(
      loadPublicBlogData(
        context,
        new Request("https://paper-portfolio-ink.dev/blog?page=7"),
      ),
    ).resolves.toEqual({
      nextPage: 2,
      posts: pageData.items,
    });

    expect(listPublicPostsPageMock).toHaveBeenCalledWith(context.db, 5, 1);
  });

  it("loads feed pages independently for lazy scrolling", async () => {
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
      nextPage: null,
    };

    listPublicPostsPageMock.mockResolvedValue(pageData);

    const { loadPublicBlogFeedData } =
      await import("../../app/features/public/blog/public-blog.server");

    await expect(
      loadPublicBlogFeedData(
        context,
        new Request("https://paper-portfolio-ink.dev/blog/feed?page=3"),
      ),
    ).resolves.toEqual({
      nextPage: null,
      page: 3,
      posts: pageData.items,
    });

    expect(listPublicPostsPageMock).toHaveBeenCalledWith(context.db, 5, 3);
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

    const { loadPublicBlogPostData } =
      await import("../../app/features/public/blog/public-blog.server");

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

    const { loadPublicBlogPostData } =
      await import("../../app/features/public/blog/public-blog.server");

    await expect(
      loadPublicBlogPostData(context, "missing-story"),
    ).rejects.toMatchObject({
      init: {
        status: 404,
      },
    });
  });
});
