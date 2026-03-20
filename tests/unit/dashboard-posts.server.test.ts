import type { AppLoadContext } from "react-router";
import type * as PostFormServerModule from "../../app/lib/posts/post-form.server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createPostMock,
  deletePostMock,
  findAvailablePostSlugMock,
  isPostSlugTakenMock,
  listPostsMock,
  parsePostFormDataMock,
  requireSessionMock,
  updatePostMock,
} = vi.hoisted(() => {
  return {
    createPostMock: vi.fn(),
    deletePostMock: vi.fn(),
    findAvailablePostSlugMock: vi.fn(),
    isPostSlugTakenMock: vi.fn(),
    listPostsMock: vi.fn(),
    parsePostFormDataMock: vi.fn(),
    requireSessionMock: vi.fn(),
    updatePostMock: vi.fn(),
  };
});

vi.mock("../../app/lib/posts/posts.server", () => {
  return {
    createPost: createPostMock,
    deletePost: deletePostMock,
    findAvailablePostSlug: findAvailablePostSlugMock,
    isPostSlugTaken: isPostSlugTakenMock,
    listPosts: listPostsMock,
    updatePost: updatePostMock,
  };
});

vi.mock("../../app/lib/posts/post-form.server", async () => {
  const actual = await vi.importActual<typeof PostFormServerModule>(
    "../../app/lib/posts/post-form.server",
  );

  return {
    ...actual,
    parsePostFormData: parsePostFormDataMock,
  };
});

vi.mock("../../app/lib/auth/session.server", () => {
  return {
    requireSession: requireSessionMock,
  };
});

describe("dashboard posts server", () => {
  const context = {
    db: { query: {} } as never,
    runtime: { platform: "node" },
  } as unknown as AppLoadContext;

  beforeEach(() => {
    createPostMock.mockReset();
    deletePostMock.mockReset();
    findAvailablePostSlugMock.mockReset();
    isPostSlugTakenMock.mockReset();
    listPostsMock.mockReset();
    parsePostFormDataMock.mockReset();
    requireSessionMock.mockReset();
    updatePostMock.mockReset();
  });

  it("loads post inventory and metrics for the dashboard route", async () => {
    const { loadDashboardPostsData } =
      await import("../../app/features/dashboard/posts/dashboard-posts.server");

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-1",
      },
    });
    listPostsMock.mockResolvedValue([
      {
        content: "# Edge telemetry",
        coverImageUrl: null,
        createdAtLabel: "2026-03-14",
        excerpt: "Draft note",
        id: "post-1",
        publishedAtLabel: null,
        slug: "edge-telemetry",
        status: "draft",
        title: "Edge telemetry",
        updatedAtLabel: "2026-03-14",
      },
      {
        content: "# Durable objects",
        coverImageUrl: null,
        createdAtLabel: "2026-03-15",
        excerpt: "Published note",
        id: "post-2",
        publishedAtLabel: "2026-03-16",
        slug: "durable-objects",
        status: "published",
        title: "Durable objects",
        updatedAtLabel: "2026-03-16",
      },
    ]);

    const response = await loadDashboardPostsData(
      context,
      new Request("http://localhost:3000/dashboard/posts"),
    );

    expect(response).toMatchObject({
      form: {
        isOpen: false,
        mode: null,
      },
      metrics: {
        draftCount: 1,
        publishedCount: 1,
        totalCount: 2,
      },
    });

    if (response instanceof Response) {
      throw new Error("Expected dashboard posts loader data, received Response");
    }

    expect(response.posts).toHaveLength(2);
  });

  it("creates a post with the current session user as author", async () => {
    const { handleDashboardPostsAction } =
      await import("../../app/features/dashboard/posts/dashboard-posts.server");

    const request = new Request("http://localhost:3000/dashboard/posts", {
      body: new URLSearchParams({
        content: "# Edge runtime",
        excerpt: "Publishing note",
        intent: "create",
        publishedAt: "2026-03-17",
        slug: "edge-runtime",
        status: "published",
        title: "Edge runtime",
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-1",
      },
    });
    parsePostFormDataMock.mockReturnValue({
      data: {
        content: "# Edge runtime",
        coverImageUrl: "",
        excerpt: "Publishing note",
        publishedAt: "2026-03-17",
        slug: "edge-runtime",
        status: "published",
        title: "Edge runtime",
      },
    });

    const response = await handleDashboardPostsAction(context, request);

    if (!(response instanceof Response)) {
      throw new Error("Expected redirect response after create action");
    }

    expect(createPostMock).toHaveBeenCalledWith(
      { query: {} },
      "user-1",
      expect.objectContaining({
        slug: "edge-runtime",
        status: "published",
      }),
    );
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe("/dashboard/posts");
  });

  it("returns a 400 state when validation fails", async () => {
    const { handleDashboardPostsAction } =
      await import("../../app/features/dashboard/posts/dashboard-posts.server");

    const request = new Request("http://localhost:3000/dashboard/posts", {
      body: new URLSearchParams({
        content: "tiny",
        excerpt: "short",
        intent: "create",
        slug: "bad slug",
        status: "draft",
        title: "No",
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-1",
      },
    });
    parsePostFormDataMock.mockReturnValue({
      errors: {
        title: "Post title must be longer.",
      },
      values: {
        content: "tiny",
        coverImageUrl: "",
        excerpt: "short",
        publishedAt: "",
        slug: "bad slug",
        status: "draft",
        title: "No",
      },
    });

    const response = await handleDashboardPostsAction(context, request);
    expect(createPostMock).not.toHaveBeenCalled();
    expect(response).toMatchObject({
      data: {
        errors: {
          title: "Post title must be longer.",
        },
      },
      init: {
        status: 400,
      },
    });
  });

  it("returns a slug field error and suggestion when the submitted post slug is taken", async () => {
    const { handleDashboardPostsAction } =
      await import("../../app/features/dashboard/posts/dashboard-posts.server");

    const request = new Request("http://localhost:3000/dashboard/posts", {
      body: new URLSearchParams({
        content: "# Edge runtime",
        excerpt: "Publishing note",
        intent: "create",
        slug: "edge-runtime",
        status: "published",
        title: "Edge Runtime",
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-1",
      },
    });
    parsePostFormDataMock.mockReturnValue({
      data: {
        content: "# Edge runtime",
        coverImageUrl: "",
        excerpt: "Publishing note",
        slug: "edge-runtime",
        status: "published",
        title: "Edge Runtime",
      },
    });
    isPostSlugTakenMock.mockResolvedValue(true);
    findAvailablePostSlugMock.mockResolvedValue("edge-runtime-2");

    const response = await handleDashboardPostsAction(context, request);

    expect(createPostMock).not.toHaveBeenCalled();
    expect(response).toMatchObject({
      data: {
        errors: {
          slug: "Bu slug zaten kullanimda. Baska bir slug sec.",
        },
        slugSuggestion: "edge-runtime-2",
      },
      init: {
        status: 409,
      },
    });
  });
});
