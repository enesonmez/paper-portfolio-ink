import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it, vi } from "vitest";

vi.mock("@tiptap/react", () => {
  return {
    __esModule: true,
    EditorContent: () => <div aria-label="Story Body" />,
    useEditor: () => null,
    useEditorState: () => null,
  };
});

const baseScreenProps = {
  form: {
    editingPostId: null,
    errors: {},
    isOpen: false,
    mode: null,
    presentation: "fullscreen" as const,
    values: {
      content: "",
      coverImageUrl: "",
      excerpt: "",
      publishedAt: "",
      slug: "",
      status: "draft" as const,
      title: "",
    },
  },
  metrics: {
    draftCount: 1,
    publishedCount: 2,
    totalCount: 3,
  },
  posts: [
    {
      content: "# Edge telemetry\n\n- daily view aggregation",
      coverImageUrl: null,
      createdAtLabel: "2026-03-15",
      excerpt: "Cloudflare uzerinde gunluk telemetry aggregation stratejisi.",
      id: "post-1",
      publishedAtLabel: "2026-03-16",
      slug: "edge-telemetry",
      status: "published" as const,
      title: "Edge Telemetry",
      updatedAtLabel: "2026-03-16",
    },
  ],
};

describe("dashboard posts route", () => {
  it("renders a posts registry with metrics and a create trigger", async () => {
    const { DashboardPostsScreen } = await import("../../app/routes/dashboard.posts");

    const router = createMemoryRouter(
      [
        {
          path: "/dashboard/posts",
          element: <DashboardPostsScreen {...baseScreenProps} />,
        },
      ],
      {
        initialEntries: ["/dashboard/posts"],
      },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByRole("heading", { level: 1, name: "Post Registry" })).toBeInTheDocument();
    expect(screen.getByText("Published Posts")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create New Post" })).toBeInTheDocument();
    expect(screen.getByText("EDGE_TELEMETRY")).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "Create Post" })).not.toBeInTheDocument();
  });

  it("renders a fullscreen compose surface without repeating the registry screen", async () => {
    const { DashboardPostsScreen } = await import("../../app/routes/dashboard.posts");

    const router = createMemoryRouter(
      [
        {
          path: "/dashboard/posts",
          element: (
            <DashboardPostsScreen
              {...baseScreenProps}
              form={{
                ...baseScreenProps.form,
                editingPostId: "post-1",
                isOpen: true,
                mode: "edit",
                presentation: "fullscreen",
                values: {
                  ...baseScreenProps.form.values,
                  content: "# Edge rollout\n\n- queue\n- cache",
                  excerpt: "Edge rollout sequence",
                  slug: "edge-rollout",
                  status: "published",
                  title: "Edge rollout",
                },
              }}
            />
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/posts?edit=post-1"],
      },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByRole("dialog", { name: "Edit Post Editor" })).toBeInTheDocument();
    expect(screen.getByText("Draft / Saved locally")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { level: 1, name: "Post Registry" }),
    ).not.toBeInTheDocument();
    const backLinks = screen.getAllByRole("link", { name: "Back To Posts" });
    expect(backLinks).toHaveLength(2);
    expect(backLinks[0]).toHaveAttribute("href", "/dashboard/posts");
    expect(backLinks[1]).toHaveAttribute("href", "/dashboard/posts");
    expect(screen.getByRole("button", { name: "Update Post" })).toBeInTheDocument();
  });
});
