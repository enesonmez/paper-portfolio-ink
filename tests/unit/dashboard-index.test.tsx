import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("dashboard index route", () => {
  it("renders the initial dashboard overview widgets", async () => {
    const { default: DashboardIndexRoute } =
      await import("../../app/routes/dashboard._index");

    render(<DashboardIndexRoute />);

    expect(screen.getByText("Total Posts")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Manage Content" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create New Post" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Logs" })).toBeInTheDocument();
  });
});
