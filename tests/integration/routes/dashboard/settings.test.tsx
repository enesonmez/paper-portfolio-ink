import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";

import {
  DashboardSettingsAccessDeniedScreen,
  DashboardSettingsScreen,
} from "~/routes/dashboard/settings";

const baseLoaderData = {
  access: "granted" as const,
  accountForm: {
    editingKey: null,
    isOpen: false,
    mode: null,
    values: {
      key: "site.name" as const,
      value: "",
    },
  },
  accountValues: {
    "contact.email": "admin@paper-portfolio-ink.dev",
    "site.domainUrl": "https://paper-portfolio-ink.dev",
    "site.name": "Paper Ink",
    "social.github": "https://github.com/enesonmez",
    "social.instagram": "https://instagram.com/paperportfolioink",
    "social.linkedin": "https://linkedin.com/in/enes-ink",
    "social.x": "https://x.com/paperinkdev",
    "appearance.primaryColor": "yellow",
    "appearance.headingFont": "vt323",
    "appearance.bodyFont": "mono",
  },
  selectedTab: "account" as const,
};

describe("dashboard settings route", () => {
  it("renders the account registry with persisted values", () => {
    const router = createMemoryRouter(
      [
        {
          path: "/dashboard/settings",
          element: <DashboardSettingsScreen loaderData={baseLoaderData} />,
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
    expect(screen.getByText("Paper Ink")).toBeInTheDocument();
    expect(screen.getByText("https://linkedin.com/in/enes-ink")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Project name/i })).toBeInTheDocument();
  });

  it("renders the account edit modal when requested", () => {
    const router = createMemoryRouter(
      [
        {
          path: "/dashboard/settings",
          element: (
            <DashboardSettingsScreen
              loaderData={{
                ...baseLoaderData,
                accountForm: {
                  editingKey: "site.name",
                  isOpen: true,
                  mode: "edit",
                  values: {
                    key: "site.name",
                    value: "Paper Ink",
                  },
                },
              }}
            />
          ),
        },
      ],
      {
        initialEntries: [
          "/dashboard/settings?tab=account&modal=edit-account-setting&setting=site.name",
        ],
      },
    );

    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole("dialog", { name: "Update configuration record" }),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("Paper Ink")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit record" })).toBeInTheDocument();
  });

  it("switches the visible content for the runtime tab", () => {
    const router = createMemoryRouter(
      [
        {
          path: "/dashboard/settings",
          element: (
            <DashboardSettingsScreen
              loaderData={{
                ...baseLoaderData,
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

  it("renders the appearance configuration cards when requested", () => {
    const router = createMemoryRouter(
      [
        {
          path: "/dashboard/settings",
          element: (
            <DashboardSettingsScreen
              loaderData={{
                ...baseLoaderData,
                selectedTab: "appearance",
              }}
            />
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/settings?tab=appearance"],
      },
    );

    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Appearance tab" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Sarı / Yellow (Default - #facc15)")).toBeInTheDocument();
    expect(screen.getByText("VT323 (Default)")).toBeInTheDocument();
    expect(screen.getByText("JetBrains Mono (Default)")).toBeInTheDocument();
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
