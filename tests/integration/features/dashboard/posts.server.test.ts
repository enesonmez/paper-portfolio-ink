import type { AppLoadContext } from "react-router";
import type * as PostFormServerModule from "~/lib/posts/post-form.server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  canAccessDashboardPostsMock,
  canCreatePostsMock,
  canMutatePostMock,
  cacheDeleteMock,
  cacheGetMock,
  cacheSetMock,
  createPostMock,
  deletePostMock,
  findAvailablePostSlugMock,
  isPostSlugTakenMock,
  listAuthorizedPostsMock,
  listPostsMock,
  parsePostFormDataMock,
  requireSessionMock,
  updatePostMock,
} = vi.hoisted(() => {
  return {
    canAccessDashboardPostsMock: vi.fn(),
    canCreatePostsMock: vi.fn(),
    canMutatePostMock: vi.fn(),
    cacheDeleteMock: vi.fn(),
    cacheGetMock: vi.fn(),
    cacheSetMock: vi.fn(),
    createPostMock: vi.fn(),
    deletePostMock: vi.fn(),
    findAvailablePostSlugMock: vi.fn(),
    isPostSlugTakenMock: vi.fn(),
    listAuthorizedPostsMock: vi.fn(),
    listPostsMock: vi.fn(),
    parsePostFormDataMock: vi.fn(),
    requireSessionMock: vi.fn(),
    updatePostMock: vi.fn(),
  };
});

vi.mock("~/lib/posts/posts.server", () => {
  return {
    createPost: createPostMock,
    deletePost: deletePostMock,
    findAvailablePostSlug: findAvailablePostSlugMock,
    isPostSlugTaken: isPostSlugTakenMock,
    listPosts: listPostsMock,
    updatePost: updatePostMock,
  };
});

vi.mock("~/lib/posts/post-form.server", async () => {
  const actual = await vi.importActual<typeof PostFormServerModule>(
    "~/lib/posts/post-form.server",
  );

  return {
    ...actual,
    parsePostFormData: parsePostFormDataMock,
  };
});

vi.mock("~/shared/authz/post-policy.server", () => {
  return {
    canAccessDashboardPosts: canAccessDashboardPostsMock,
    canCreatePosts: canCreatePostsMock,
    canMutatePost: canMutatePostMock,
    listAuthorizedPosts: listAuthorizedPostsMock,
  };
});

vi.mock("~/shared/auth/session.server", () => {
  return {
    requireSession: requireSessionMock,
  };
});

describe("dashboard posts server", () => {
  const context = {
    cache: {
      delete: cacheDeleteMock,
      get: cacheGetMock,
      set: cacheSetMock,
    },
    db: { query: {} } as never,
    runtime: { platform: "node" },
  } as unknown as AppLoadContext;

  beforeEach(() => {
    canAccessDashboardPostsMock.mockReset();
    canCreatePostsMock.mockReset();
    canMutatePostMock.mockReset();
    cacheDeleteMock.mockReset();
    cacheGetMock.mockReset();
    cacheSetMock.mockReset();
    createPostMock.mockReset();
    deletePostMock.mockReset();
    findAvailablePostSlugMock.mockReset();
    isPostSlugTakenMock.mockReset();
    listAuthorizedPostsMock.mockReset();
    listPostsMock.mockReset();
    parsePostFormDataMock.mockReset();
    requireSessionMock.mockReset();
    updatePostMock.mockReset();

    canAccessDashboardPostsMock.mockReturnValue(true);
    canCreatePostsMock.mockReturnValue(true);
    canMutatePostMock.mockResolvedValue(true);
  }, 20000);

  it("loads post inventory and metrics for the dashboard route", async () => {
    const { loadDashboardPostsData } =
      await import("~/features/dashboard/posts/server");

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-1",
        role: "admin",
      },
    });
    listAuthorizedPostsMock.mockResolvedValue([
      {
        authorId: "user-1",
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
        authorId: "user-2",
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
      access: "granted",
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
  }, 20000);

  it("returns denied loader data when post inventory access is not allowed", async () => {
    const { loadDashboardPostsData } =
      await import("~/features/dashboard/posts/server");

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-1",
        role: "admin",
      },
    });
    canAccessDashboardPostsMock.mockReturnValue(false);

    await expect(
      loadDashboardPostsData(
        context,
        new Request("http://localhost:3000/dashboard/posts"),
      ),
    ).rejects.toMatchObject({
      code: "posts.read.forbidden",
      responseData: {
        access: "denied",
      },
      status: 403,
    });
    expect(listAuthorizedPostsMock).not.toHaveBeenCalled();
  });

  it("creates a post with the current session user as author", async () => {
    const { handleDashboardPostsAction } =
      await import("~/features/dashboard/posts/server");

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
        role: "admin",
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
    expect(response.headers.get("Location")).toBe("/tr/dashboard/posts");
    expect(cacheDeleteMock).toHaveBeenCalledWith(
      "http://localhost:3000/__cache/public/blog/page-1",
    );
  }, 20000);

  it("returns a 400 state when validation fails", async () => {
    const { handleDashboardPostsAction } =
      await import("~/features/dashboard/posts/server");

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
        role: "admin",
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

    await expect(handleDashboardPostsAction(context, request)).rejects.toMatchObject({
      code: "posts.validation",
      responseData: {
        errors: {
          title: "Post title must be longer.",
        },
      },
      status: 400,
    });
    expect(createPostMock).not.toHaveBeenCalled();
  });

  it("returns a 403 form error for unauthorized create attempts", async () => {
    const { handleDashboardPostsAction } =
      await import("~/features/dashboard/posts/server");

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
        role: "admin",
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
    canCreatePostsMock.mockReturnValue(false);

    await expect(handleDashboardPostsAction(context, request)).rejects.toMatchObject({
      code: "posts.create.forbidden",
      responseData: {
        errors: {
          form: "Bu islemi gerceklestirme yetkiniz bulunmuyor.",
        },
      },
      status: 403,
    });
    expect(createPostMock).not.toHaveBeenCalled();
  });

  it("returns a slug field error and suggestion when the submitted post slug is taken", async () => {
    const { handleDashboardPostsAction } =
      await import("~/features/dashboard/posts/server");

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
        role: "admin",
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

    await expect(handleDashboardPostsAction(context, request)).rejects.toMatchObject({
      code: "posts.create.duplicate_slug",
      responseData: {
        errors: {
          slug: "Bu slug zaten kullanimda. Baska bir slug sec.",
        },
        slugSuggestion: "edge-runtime-2",
      },
      status: 409,
    });
    expect(createPostMock).not.toHaveBeenCalled();
  }, 20000);

  it("returns a 403 form error for unauthorized update attempts", async () => {
    const { handleDashboardPostsAction } =
      await import("~/features/dashboard/posts/server");

    const request = new Request("http://localhost:3000/dashboard/posts", {
      body: new URLSearchParams({
        content: "# Edge runtime",
        excerpt: "Publishing note",
        intent: "update",
        postId: "post-1",
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
        role: "author",
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
    canMutatePostMock.mockResolvedValue(false);

    await expect(handleDashboardPostsAction(context, request)).rejects.toMatchObject({
      code: "posts.update.forbidden",
      responseData: {
        errors: {
          form: "Bu islemi gerceklestirme yetkiniz bulunmuyor.",
        },
      },
      status: 403,
    });
    expect(updatePostMock).not.toHaveBeenCalled();
  });

  it("returns a 403 form error for unauthorized delete attempts", async () => {
    const { handleDashboardPostsAction } =
      await import("~/features/dashboard/posts/server");

    const request = new Request("http://localhost:3000/dashboard/posts", {
      body: new URLSearchParams({
        intent: "delete",
        postId: "post-1",
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-1",
        role: "author",
      },
    });
    canMutatePostMock.mockResolvedValue(false);

    await expect(handleDashboardPostsAction(context, request)).rejects.toMatchObject({
      code: "posts.delete.forbidden",
      responseData: {
        errors: {
          form: "Bu islemi gerceklestirme yetkiniz bulunmuyor.",
        },
      },
      status: 403,
    });
    expect(deletePostMock).not.toHaveBeenCalled();
  });

  it("rejects unsupported intents before authorization or writes", async () => {
    const { handleDashboardPostsAction } =
      await import("~/features/dashboard/posts/server");

    const request = new Request("http://localhost:3000/dashboard/posts", {
      body: new URLSearchParams({
        intent: "archive",
        postId: "post-1",
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });

    await expect(handleDashboardPostsAction(context, request)).rejects.toMatchObject({
      code: "posts.mutation.invalid_intent",
      details: {
        intent: "archive",
      },
      responseData: {
        errors: {
          form: "Bu islemi gerceklestirme yetkiniz bulunmuyor.",
        },
      },
      status: 400,
    });
    expect(requireSessionMock).not.toHaveBeenCalled();
    expect(parsePostFormDataMock).not.toHaveBeenCalled();
    expect(createPostMock).not.toHaveBeenCalled();
    expect(updatePostMock).not.toHaveBeenCalled();
    expect(deletePostMock).not.toHaveBeenCalled();
  });
});
