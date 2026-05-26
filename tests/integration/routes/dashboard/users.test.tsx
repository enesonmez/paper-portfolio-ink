import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";

const baseScreenProps = {
  filters: {
    active: "all" as const,
    role: "all" as const,
    searchQuery: "",
  },
  form: {
    editingUserId: null,
    errors: {},
    isOpen: false,
    mode: null,
    values: {
      avatarUrl: "",
      bio: "",
      displayName: "",
      email: "",
      isActive: true,
      password: "",
      role: "author" as const,
    },
  },
  metrics: {
    adminCount: 1,
    authorCount: 2,
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
  users: [
    {
      avatarUrl: null,
      bio: "Platform owner",
      createdAtLabel: "2026-03-20",
      displayName: "Enes Admin",
      email: "admin@example.com",
      id: "user-admin",
      isActive: true,
      role: "admin" as const,
      updatedAtLabel: "2026-03-20",
    },
  ],
};

describe("dashboard users route", () => {
  it("renders a users registry with create trigger", async () => {
    const { DashboardUsersScreen } = await import("~/routes/dashboard/users");

    const router = createMemoryRouter(
      [
        {
          path: "/dashboard/users",
          element: <DashboardUsersScreen {...baseScreenProps} />,
        },
      ],
      {
        initialEntries: ["/dashboard/users"],
      },
    );

    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "User registry" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Admin seats")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create new user" })).toBeInTheDocument();
    expect(screen.getByText("admin@example.com")).toBeInTheDocument();
    expect(
      screen.queryByRole("dialog", { name: "Create user" }),
    ).not.toBeInTheDocument();
  }, 20000);

  it("hides user mutation controls when write permissions are missing", async () => {
    const { DashboardUsersScreen } = await import("~/routes/dashboard/users");

    const router = createMemoryRouter(
      [
        {
          path: "/dashboard/users",
          element: (
            <DashboardUsersScreen
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
        initialEntries: ["/dashboard/users"],
      },
    );

    render(<RouterProvider router={router} />);

    expect(
      screen.queryByRole("link", { name: "Create new user" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /edit admin@example.com/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /deactivate admin@example.com/i }),
    ).not.toBeInTheDocument();
  }, 20000);

  it("renders a modal form when user creation is requested", async () => {
    const { DashboardUsersScreen } = await import("~/routes/dashboard/users");

    const router = createMemoryRouter(
      [
        {
          path: "/dashboard/users",
          element: (
            <DashboardUsersScreen
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
        initialEntries: ["/dashboard/users?modal=create"],
      },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByRole("dialog", { name: "Create user" })).toBeInTheDocument();
    expect(screen.getByLabelText("Display name")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  }, 20000);

  it("renders the restricted access warning for non-admin viewers", async () => {
    const { DashboardUsersAccessDeniedScreen } =
      await import("~/routes/dashboard/users");

    render(<DashboardUsersAccessDeniedScreen viewerRole="author" />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Access denied" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("You do not have permission to view this area."),
    ).toBeInTheDocument();
    expect(screen.getByText("Session role: author")).toBeInTheDocument();
  }, 20000);

  it("renders a popup when a destructive user action returns a form-level error", async () => {
    const { DashboardUsersScreen } = await import("~/routes/dashboard/users");

    const router = createMemoryRouter(
      [
        {
          path: "/dashboard/users",
          element: (
            <DashboardUsersScreen
              {...baseScreenProps}
              actionError="Son aktif admin hesabi pasiflestirilemez."
            />
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/users"],
      },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByRole("dialog", { name: "Action denied" })).toBeInTheDocument();
    expect(
      screen.getByRole("alert", {
        name: "",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Son aktif admin hesabi pasiflestirilemez.",
    );
    expect(screen.getByRole("link", { name: "Dismiss" })).toBeInTheDocument();
  }, 20000);
});
