import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";

const baseScreenProps = {
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
    const { DashboardUsersScreen } = await import("../../app/routes/dashboard.users");

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
  });

  it("renders a modal form when user creation is requested", async () => {
    const { DashboardUsersScreen } = await import("../../app/routes/dashboard.users");

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
  });

  it("renders the restricted access warning for non-admin viewers", async () => {
    const { DashboardUsersAccessDeniedScreen } =
      await import("../../app/routes/dashboard.users");

    render(<DashboardUsersAccessDeniedScreen viewerRole="author" />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Restricted flow" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("You do not have permission to access this flow."),
    ).toBeInTheDocument();
    expect(screen.getByText("Current role: author")).toBeInTheDocument();
  });

  it("renders a popup when a destructive user action returns a form-level error", async () => {
    const { DashboardUsersScreen } = await import("../../app/routes/dashboard.users");

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

    expect(screen.getByRole("dialog", { name: "Action blocked" })).toBeInTheDocument();
    expect(
      screen.getByRole("alert", {
        name: "",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Son aktif admin hesabi pasiflestirilemez.",
    );
    expect(screen.getByRole("link", { name: "Dismiss" })).toBeInTheDocument();
  });
});
