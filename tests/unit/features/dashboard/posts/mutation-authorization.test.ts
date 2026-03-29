import { beforeEach, describe, expect, it, vi } from "vitest";

const { canCreatePostsMock, canMutatePostMock } = vi.hoisted(() => ({
  canCreatePostsMock: vi.fn(),
  canMutatePostMock: vi.fn(),
}));

vi.mock("~/shared/authz/post-policy.server", () => ({
  canCreatePosts: canCreatePostsMock,
  canMutatePost: canMutatePostMock,
}));

import { authorizePostMutationOrThrow } from "~/features/dashboard/posts/operations/_shared/authorization.server";

describe("dashboard posts mutation authorization", () => {
  beforeEach(() => {
    canCreatePostsMock.mockReset();
    canMutatePostMock.mockReset();
  });

  it("requires create permission for create intent", async () => {
    canCreatePostsMock.mockReturnValue(false);

    await expect(
      authorizePostMutationOrThrow({
        actor: {
          authzVersion: 1,
          claims: [],
          role: "author",
          userId: "user-author",
        },
        context: {} as never,
        formCopy: {
          errors: {
            deleteMissingPost: "missing-delete",
            forbidden: "forbidden",
            missingAuthor: "missing-author",
            updateMissingPost: "missing-update",
          },
        },
        intent: "create",
        postId: "",
        values: {
          content: "# Edge runtime content",
          coverImageUrl: "",
          excerpt: "Publishing note",
          slug: "edge-runtime",
          status: "published",
          title: "Edge runtime",
        },
      }),
    ).rejects.toMatchObject({
      code: "posts.create.forbidden",
      responseData: {
        errors: {
          form: "forbidden",
        },
        values: {
          slug: "edge-runtime",
          title: "Edge runtime",
        },
      },
      status: 403,
    });
  });

  it("requires owner/any policy for update intent", async () => {
    canMutatePostMock.mockResolvedValue(false);

    await expect(
      authorizePostMutationOrThrow({
        actor: {
          authzVersion: 1,
          claims: [],
          role: "author",
          userId: "user-author",
        },
        context: {} as never,
        formCopy: {
          errors: {
            deleteMissingPost: "missing-delete",
            forbidden: "forbidden",
            missingAuthor: "missing-author",
            updateMissingPost: "missing-update",
          },
        },
        intent: "update",
        postId: "post-1",
        values: {
          content: "# Edge runtime content",
          coverImageUrl: "",
          excerpt: "Publishing note",
          slug: "edge-runtime",
          status: "published",
          title: "Edge runtime",
        },
      }),
    ).rejects.toMatchObject({
      code: "posts.update.forbidden",
      details: {
        postId: "post-1",
      },
      responseData: {
        errors: {
          form: "forbidden",
        },
      },
      status: 403,
    });
  });
});
