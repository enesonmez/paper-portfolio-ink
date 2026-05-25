import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";

import {
  DashboardSettingsAccessDeniedScreen,
  DashboardSettingsScreen,
} from "~/routes/dashboard/settings";

describe("dashboard settings route", () => {
  it("renders the account tab mock surface", () => {
    const router = createMemoryRouter(
      [
        {
          path: "/dashboard/settings",
          element: (
            <DashboardSettingsScreen
              loaderData={{
                access: "granted",
                selectedTab: "account",
              }}
            />
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/settings?tab=account"],
      },
    );

    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Dashboard settings" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Account.*07/i })).toBeInTheDocument();
    expect(screen.getByText("Paper Portfolio Ink")).toBeInTheDocument();
    expect(screen.getByText("linkedin.com/in/enes-ink")).toBeInTheDocument();
  });

  it("switches the visible content for the runtime tab", () => {
    const router = createMemoryRouter(
      [
        {
          path: "/dashboard/settings",
          element: (
            <DashboardSettingsScreen
              loaderData={{
                access: "granted",
                selectedTab: "runtime",
              }}
            />
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/settings?tab=runtime"],
      },
    );

    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Runtime tab" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Runtime cache contract")).toBeInTheDocument();
    expect(screen.getByText("Cloudflare Pages + D1")).toBeInTheDocument();
    expect(screen.getByText("Pending runtime actions")).toBeInTheDocument();
  });

  it("renders the denied state for unauthorized viewers", () => {
    const router = createMemoryRouter(
      [
        {
          path: "/dashboard/settings",
          element: <DashboardSettingsAccessDeniedScreen viewerRole="author" />,
        },
      ],
      {
        initialEntries: ["/dashboard/settings"],
      },
    );

    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Restricted flow" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Current role/i)).toBeInTheDocument();
    expect(screen.getByText(/author/i)).toBeInTheDocument();
  });
});
