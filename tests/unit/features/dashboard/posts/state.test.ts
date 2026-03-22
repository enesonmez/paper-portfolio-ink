import { describe, expect, it } from "vitest";

import {
  buildDashboardPostsHref,
  buildDashboardPostsMetrics,
  mergeDashboardPostsFormState,
  resolveDashboardPostsForm,
} from "~/features/dashboard/posts/state";

describe("dashboard posts state helpers", () => {
  it("builds hrefs with explicit fullscreen presentation only when needed", () => {
    expect(buildDashboardPostsHref()).toBe("/dashboard/posts");
    expect(
      buildDashboardPostsHref({
        modal: "create",
        presentation: "fullscreen",
      }),
    ).toBe("/dashboard/posts?modal=create&presentation=fullscreen");
    expect(
      buildDashboardPostsHref({
        editId: "post-1",
        presentation: "modal",
      }),
    ).toBe("/dashboard/posts?edit=post-1");
  });

  it("derives metrics and edit form state from post rows", () => {
    const posts = [
      {
        authorId: "user-1",
        content: "# Edge note",
        coverImageUrl: null,
        createdAtLabel: "2026-03-20",
        excerpt: "Draft",
        id: "post-1",
        publishedAtLabel: null,
        slug: "edge-note",
        status: "draft" as const,
        title: "Edge note",
        updatedAtLabel: "2026-03-20",
      },
      {
        authorId: "user-1",
        content: "# Cache window",
        coverImageUrl: null,
        createdAtLabel: "2026-03-21",
        excerpt: "Published",
        id: "post-2",
        publishedAtLabel: "2026-03-21",
        slug: "cache-window",
        status: "published" as const,
        title: "Cache window",
        updatedAtLabel: "2026-03-21",
      },
    ];

    expect(buildDashboardPostsMetrics(posts)).toEqual({
      draftCount: 1,
      publishedCount: 1,
      totalCount: 2,
    });
    expect(
      resolveDashboardPostsForm({
        editId: "post-2",
        modal: null,
        posts,
      }),
    ).toMatchObject({
      editingPostId: "post-2",
      isOpen: true,
      mode: "edit",
      presentation: "fullscreen",
      values: {
        content: "# Cache window",
        excerpt: "Published",
        slug: "cache-window",
        status: "published",
        title: "Cache window",
      },
    });
  });

  it("merges action validation state without losing the loader presentation mode", () => {
    expect(
      mergeDashboardPostsFormState(
        {
          editingPostId: "post-1",
          isOpen: true,
          mode: "edit",
          presentation: "fullscreen",
          slugSuggestion: null,
          values: {
            content: "{}",
            coverImageUrl: "",
            excerpt: "",
            slug: "edge-note",
            status: "draft",
            title: "Edge note",
          },
        },
        {
          errors: {
            slug: "Duplicate slug",
          },
          slugSuggestion: "edge-note-2",
          values: {
            content: "{}",
            coverImageUrl: "",
            excerpt: "",
            slug: "edge-note",
            status: "draft",
            title: "Edge note",
          },
        },
      ),
    ).toMatchObject({
      editingPostId: "post-1",
      errors: {
        slug: "Duplicate slug",
      },
      isOpen: true,
      mode: "edit",
      presentation: "fullscreen",
      slugSuggestion: "edge-note-2",
    });
  });
});
