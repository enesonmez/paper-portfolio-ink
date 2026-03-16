import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";

const baseScreenProps = {
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
  },
  metrics: {
    featuredCount: 1,
    liveCount: 2,
    totalCount: 3,
  },
  projects: [
    {
      coverImageUrl: null,
      createdAtLabel: "2026-03-16",
      id: "project-1",
      isFeatured: true,
      liveUrl: "https://cyber.paper-enes-ink.dev",
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
    const { DashboardProjectsScreen } =
      await import("../../app/routes/dashboard.projects");

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
      screen.getByRole("heading", { level: 1, name: "Project Registry" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Total Projects")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Create New Project" }),
    ).toBeInTheDocument();
    expect(screen.getByText("CYBER_STORE_FRONT")).toBeInTheDocument();
    expect(screen.queryByLabelText("Project Name")).not.toBeInTheDocument();
  });

  it("renders the project form inside a modal when requested", async () => {
    const { DashboardProjectsScreen } =
      await import("../../app/routes/dashboard.projects");

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

    expect(screen.getByRole("dialog", { name: "Create Project" })).toBeInTheDocument();
    expect(screen.getByLabelText("Project Name")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create New Project" }),
    ).toBeInTheDocument();
  });
});
