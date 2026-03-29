import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import DashboardOverviewScreen from "~/features/dashboard/overview/screen";

describe("dashboard overview screen", () => {
  it("renders metrics, content actions, and runtime logs directly from the feature slice", () => {
    render(
      <MemoryRouter>
        <DashboardOverviewScreen />
      </MemoryRouter>,
    );

    expect(screen.getByText("Total posts")).toBeInTheDocument();
    expect(screen.getByText("Total views")).toBeInTheDocument();
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
    expect(screen.getAllByRole("button", { name: /^Edit / })).toHaveLength(3);
    expect(screen.getAllByRole("button", { name: /^Delete / })).toHaveLength(3);
  });
});
