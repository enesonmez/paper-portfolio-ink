import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";

describe("dashboard index route", () => {
  it("renders the initial dashboard overview widgets", async () => {
    const { default: DashboardIndexRoute } =
      await import("../../app/routes/dashboard._index");

    const router = createMemoryRouter(
      [
        {
          path: "/dashboard",
          element: <DashboardIndexRoute />,
        },
      ],
      {
        initialEntries: ["/dashboard"],
      },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByText("Total Posts")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Manage Content" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create New Post" })).toHaveAttribute(
      "href",
      "/dashboard/posts?modal=create",
    );
    expect(screen.getByRole("heading", { level: 2, name: "Logs" })).toBeInTheDocument();
  });
});
