import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";

import { DashboardAnalyticsScreen } from "~/features/dashboard/analytics/screen";

const baseScreenProps = {
  filters: {
    searchQuery: "",
  },
  metrics: {
    totalViews: 125,
    avgScrollRate: 68.5,
    avgTimeSpent: 124.2,
  },
  pagination: {
    currentCursor: null,
    direction: "next" as const,
    hasNextPage: false,
    hasPreviousPage: false,
    nextCursor: null,
    pageSize: 20,
    previousCursor: null,
  },
  permissions: {
    canReadAny: true,
    canReadOwn: true,
  },
  posts: [
    {
      id: "post-1",
      title: "Neo-Brutalism in UI",
      slug: "ui-neobrutalism",
      authorId: "user-1",
      viewsCount: 85,
      avgScrollRate: 72.3,
      avgSecondsSpent: 145.0,
    },
    {
      id: "post-2",
      title: "Scaling Tailwind CSS",
      slug: "scaling-tailwind",
      authorId: "user-1",
      viewsCount: 40,
      avgScrollRate: 60.5,
      avgSecondsSpent: 80.2,
    },
  ],
  dailyViews: [
    { date: "2026-05-25", count: 50 },
    { date: "2026-05-26", count: 75 },
  ],
  monthlyViews: [
    { month: "2026-04", count: 200 },
    { month: "2026-05", count: 125 },
  ],
  form: {
    viewId: null,
    isOpen: false,
    selectedPostTitle: "",
    postDailyViews: [],
    postMonthlyViews: [],
  },
};

describe("dashboard analytics route screen", () => {
  it("renders metrics cards, overall aggregated view charts and posts performance list", () => {
    const router = createMemoryRouter(
      [
        {
          path: "/dashboard/analytics",
          element: <DashboardAnalyticsScreen {...baseScreenProps} />,
        },
      ],
      {
        initialEntries: ["/dashboard/analytics"],
      },
    );

    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Analytics & Insights" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Post Analytics Registry" }),
    ).toBeInTheDocument();

    expect(screen.getByText("125")).toBeInTheDocument();
    expect(screen.getByText("68.5%")).toBeInTheDocument();
    expect(screen.getByText("124.2s")).toBeInTheDocument();

    expect(screen.getByText("NEO-BRUTALISM_IN_UI")).toBeInTheDocument();
    expect(screen.getByText("SCALING_TAILWIND_CSS")).toBeInTheDocument();

    const chartButtons = screen.getAllByRole("link", { name: "Views" });
    expect(chartButtons).toHaveLength(2);
    expect(chartButtons[0]).toHaveAttribute("href", "/dashboard/analytics?view=post-1");
  });

  it("renders a detailed historical popup modal when viewing a specific post's analytics", () => {
    const router = createMemoryRouter(
      [
        {
          path: "/dashboard/analytics",
          element: (
            <DashboardAnalyticsScreen
              {...baseScreenProps}
              form={{
                viewId: "post-1",
                isOpen: true,
                selectedPostTitle: "Neo-Brutalism in UI",
                postDailyViews: [{ date: "2026-05-26", count: 85 }],
                postMonthlyViews: [{ month: "2026-05", count: 85 }],
              }}
            />
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/analytics?view=post-1"],
      },
    );

    render(<RouterProvider router={router} />);

    const dialog = screen.getByRole("dialog", { name: "Neo-Brutalism in UI" });
    expect(dialog).toBeInTheDocument();

    expect(
      screen.getByText(
        "Daily and monthly view counts distribution for the selected post.",
      ),
    ).toBeInTheDocument();
  });
});
