import { fireEvent, render, screen, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";

const baseScreenProps = {
  filters: {
    searchQuery: "",
    status: "all" as const,
  },
  form: {
    editingProjectId: null,
    errors: {},
    isOpen: false,
    mode: null,
    values: {
      coverImageUrl: "",
      description: "",
      isFeatured: false,
      liveUrl: "",
      repositoryUrl: "",
      slug: "",
      sortOrder: "0",
      status: "draft" as const,
      summary: "",
      title: "",
    },
    slugSuggestion: null,
  },
  metrics: {
    featuredCount: 1,
    liveCount: 2,
    totalCount: 3,
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
    canCreate: true,
    canDelete: true,
    canUpdate: true,
  },
  projects: [
    {
      coverImageUrl: null,
      createdAtLabel: "2026-03-16",
      description: "Commerce frontend built for edge delivery.",
      id: "project-1",
      isFeatured: true,
      liveUrl: "https://cyber.paper-portfolio-ink.dev",
      repositoryUrl: "https://github.com/enes/cyber-store-front",
      slug: "cyber-store-front",
      sortOrder: 1,
      status: "published" as const,
      summary: "Commerce frontend built for edge delivery.",
      title: "Cyber Store Front",
    },
  ],
};

describe("dashboard projects route", () => {
  it("renders a full-width projects registry with create trigger", async () => {
    const { DashboardProjectsScreen } = await import("~/routes/dashboard/projects");

    const router = createMemoryRouter(
      [
        {
          path: "/dashboard/projects",
          element: <DashboardProjectsScreen {...baseScreenProps} />,
        },
      ],
      {
        initialEntries: ["/dashboard/projects"],
      },
    );

    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Project registry" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Total projects")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Create new project" }),
    ).toBeInTheDocument();
    expect(screen.getByText("CYBER_STORE_FRONT")).toBeInTheDocument();
    expect(screen.queryByLabelText("Project Name")).not.toBeInTheDocument();
  }, 20000);

  it("hides project mutation controls when write permissions are missing", async () => {
    const { DashboardProjectsScreen } = await import("~/routes/dashboard/projects");

    const router = createMemoryRouter(
      [
        {
          path: "/dashboard/projects",
          element: (
            <DashboardProjectsScreen
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
        initialEntries: ["/dashboard/projects"],
      },
    );

    render(<RouterProvider router={router} />);

    expect(
      screen.queryByRole("link", { name: "Create new project" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /edit cyber_store_front/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /delete cyber_store_front/i }),
    ).not.toBeInTheDocument();
  }, 20000);

  it("renders the project form inside a modal when requested", async () => {
    const { DashboardProjectsScreen } = await import("~/routes/dashboard/projects");

    const router = createMemoryRouter(
      [
        {
          path: "/dashboard/projects",
          element: (
            <DashboardProjectsScreen
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
        initialEntries: ["/dashboard/projects?modal=create"],
      },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByRole("dialog", { name: "Create project" })).toBeInTheDocument();
    expect(screen.getByLabelText("Project name")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create new project" }),
    ).toBeInTheDocument();
  }, 20000);

  it("shows a title-based slug suggestion in the project modal", async () => {
    const { DashboardProjectsScreen } = await import("~/routes/dashboard/projects");

    const router = createMemoryRouter(
      [
        {
          path: "/dashboard/projects",
          element: (
            <DashboardProjectsScreen
              {...baseScreenProps}
              form={{
                ...baseScreenProps.form,
                isOpen: true,
                mode: "create",
                values: {
                  ...baseScreenProps.form.values,
                  slug: "",
                  title: "Paper Portfolio Ink",
                },
              }}
            />
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/projects?modal=create"],
      },
    );

    render(<RouterProvider router={router} />);

    expect(
      await screen.findByRole("button", {
        name: "Use suggested slug: paper-portfolio-ink",
      }),
    ).toBeInTheDocument();
  }, 20000);

  it("recomputes the project slug suggestion after a duplicate-slug response when title changes", async () => {
    const { DashboardProjectsScreen } = await import("~/routes/dashboard/projects");

    const router = createMemoryRouter(
      [
        {
          path: "/dashboard/projects",
          element: (
            <DashboardProjectsScreen
              {...baseScreenProps}
              form={{
                ...baseScreenProps.form,
                errors: {
                  slug: "Bu slug zaten kullanimda. Baska bir slug sec.",
                },
                isOpen: true,
                mode: "create",
                slugSuggestion: "paper-portfolio-ink-2",
                values: {
                  ...baseScreenProps.form.values,
                  slug: "paper-portfolio-ink",
                  title: "Paper Portfolio Ink",
                },
              }}
            />
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/projects?modal=create"],
      },
    );

    render(<RouterProvider router={router} />);

    expect(
      await screen.findByRole("button", {
        name: "Use suggested slug: paper-portfolio-ink-2",
      }),
    ).toBeInTheDocument();

    fireEvent.input(screen.getByLabelText("Project name"), {
      target: {
        value: "Portfolio Radar",
      },
    });

    expect(
      await screen.findByRole("button", {
        name: "Use suggested slug: portfolio-radar",
      }),
    ).toBeInTheDocument();
  }, 20000);

  it("surfaces action errors in a dismissible modal when the form is closed", async () => {
    const { DashboardProjectsScreen } = await import("~/routes/dashboard/projects");

    const router = createMemoryRouter(
      [
        {
          path: "/dashboard/projects",
          element: (
            <DashboardProjectsScreen
              {...baseScreenProps}
              actionError="Delete action blocked"
            />
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/projects"],
      },
    );

    render(<RouterProvider router={router} />);

    const dialog = screen.getByRole("dialog", { name: "Action denied" });

    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getAllByText("Delete action blocked")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Dismiss" })).toHaveAttribute(
      "href",
      "/dashboard/projects",
    );
  }, 20000);
});
