import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";

const baseScreenProps = {
  form: {
    editingSkillId: null,
    errors: {},
    isOpen: false,
    mode: null,
    values: {
      iconKey: "database" as const,
      name: "",
      sortOrder: "0",
      summary: "",
    },
  },
  metrics: {
    totalCount: 2,
  },
  permissions: {
    canCreate: true,
    canDelete: true,
    canUpdate: true,
  },
  skills: [
    {
      createdAtLabel: "2026-03-21",
      iconKey: "database" as const,
      id: "skill-1",
      name: "Cloudflare D1",
      sortOrder: 3,
      slug: "cloudflare-d1",
      summary: "Distributed relational data workflows for edge-hosted applications.",
    },
  ],
};

describe("dashboard skills route", () => {
  it("renders the skills registry with create trigger", async () => {
    const { DashboardSkillsScreen } = await import("~/routes/dashboard/skills");

    const router = createMemoryRouter(
      [
        {
          path: "/dashboard/skills",
          element: <DashboardSkillsScreen {...baseScreenProps} />,
        },
      ],
      {
        initialEntries: ["/dashboard/skills"],
      },
    );

    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Skills registry" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Total skills")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create skill" })).toBeInTheDocument();
    expect(screen.getByText("CLOUDFLARE_D1")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Distributed relational data workflows for edge-hosted applications.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Database")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  }, 20000);

  it("hides skill mutation controls when write permissions are missing", async () => {
    const { DashboardSkillsScreen } = await import("~/routes/dashboard/skills");

    const router = createMemoryRouter(
      [
        {
          path: "/dashboard/skills",
          element: (
            <DashboardSkillsScreen
              {...baseScreenProps}
              permissions={{
                canCreate: false,
                canDelete: false,
                canUpdate: false,
              }}
            />
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/skills"],
      },
    );

    render(<RouterProvider router={router} />);

    expect(
      screen.queryByRole("link", { name: "Create skill" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /edit cloudflare_d1/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /delete cloudflare_d1/i }),
    ).not.toBeInTheDocument();
  }, 20000);

  it("renders the create modal when requested", async () => {
    const { DashboardSkillsScreen } = await import("~/routes/dashboard/skills");

    const router = createMemoryRouter(
      [
        {
          path: "/dashboard/skills",
          element: (
            <DashboardSkillsScreen
              {...baseScreenProps}
              form={{
                ...baseScreenProps.form,
                isOpen: true,
                mode: "create",
              }}
            />
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/skills?modal=create"],
      },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByRole("dialog", { name: "Create skill" })).toBeInTheDocument();
    expect(screen.getByLabelText("Skill name")).toBeInTheDocument();
    expect(screen.getByLabelText("Sort order")).toBeInTheDocument();
    expect(screen.getByLabelText("Summary")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create skill" })).toBeInTheDocument();
  }, 20000);

  it("renders the edit modal with existing values when requested", async () => {
    const { DashboardSkillsScreen } = await import("~/routes/dashboard/skills");

    const router = createMemoryRouter(
      [
        {
          path: "/dashboard/skills",
          element: (
            <DashboardSkillsScreen
              {...baseScreenProps}
              form={{
                ...baseScreenProps.form,
                editingSkillId: "skill-1",
                isOpen: true,
                mode: "edit",
                values: {
                  iconKey: "database",
                  name: "Cloudflare D1",
                  sortOrder: "3",
                  summary:
                    "Distributed relational data workflows for edge-hosted applications.",
                },
              }}
            />
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/skills?edit=skill-1"],
      },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByRole("dialog", { name: "Edit skill" })).toBeInTheDocument();
    expect(screen.getByDisplayValue("Cloudflare D1")).toBeInTheDocument();
    expect(screen.getByDisplayValue("3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Update skill" })).toBeInTheDocument();
  }, 20000);

  it("renders a restricted screen for non-admin viewers", async () => {
    const { DashboardSkillsAccessDeniedScreen } =
      await import("~/routes/dashboard/skills");

    const router = createMemoryRouter(
      [
        {
          path: "/dashboard/skills",
          element: <DashboardSkillsAccessDeniedScreen viewerRole="author" />,
        },
      ],
      {
        initialEntries: ["/dashboard/skills"],
      },
    );

    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Access denied" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Session role: author")).toBeInTheDocument();
  }, 20000);
});
