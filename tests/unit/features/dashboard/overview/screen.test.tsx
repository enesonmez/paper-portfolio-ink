import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import DashboardOverviewScreen from "~/features/dashboard/overview/screen";

describe("dashboard overview screen", () => {
  it("renders metrics, content actions, and runtime logs directly from the feature slice", () => {
    const mockProps = {
      stats: {
        postCount: 42,
        projectCount: 5,
        activeUserCount: 2,
        skillCount: 10,
      },
      recentLogs: [
        {
          id: "log-1",
          action: "update",
          resource: "posts",
          result: "success",
          message: "Updated blog post: Neo-Brutalism in UI Design",
          createdAt: Date.now(),
        },
      ],
      recentPosts: [
        {
          id: "post-1",
          title: "UI Tasariminda Neo-Brutalism",
          slug: "neo-brutalism",
          excerpt: "Neo-brutalist tasarımların detayları.",
          status: "published",
          updatedAt: Date.now(),
        },
      ],
      analytics: {
        enabled: false,
        dailyViews: [],
        monthlyViews: [],
      },
    };

    render(
      <MemoryRouter>
        <DashboardOverviewScreen {...mockProps} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Total posts")).toBeInTheDocument();
    expect(screen.getByText("Total projects")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Manage content" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create new post" })).toHaveAttribute(
      "href",
      "/dashboard/posts?modal=create",
    );
    expect(
      screen.getByText("Updated blog post: Neo-Brutalism in UI Design"),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /^Edit/ })).toHaveLength(1);
  });
});
