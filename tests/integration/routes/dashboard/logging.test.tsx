import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";
import type { DashboardLoggingGrantedLoaderData } from "~/features/dashboard/logging/state";

const grantedLoaderData = {
  access: "granted" as const,
  entries: {
    errors: [
      {
        category: "server",
        code: "logging.error",
        createdAt: new Date("2026-03-23T09:00:00.000Z"),
        fingerprint: "fingerprint-1",
        id: "error-1",
        locale: "en",
        message: "Unhandled worker error",
        metadataJson: "{}",
        method: "POST",
        path: "/dashboard/posts",
        requestId: "req-1",
        routeId: "dashboard.posts",
        severity: "error" as const,
        stack: null,
        statusCode: 500,
        userId: "user-1",
        userRole: "admin" as const,
      },
    ],
    history: [
      {
        action: "update",
        createdAt: new Date("2026-03-23T08:00:00.000Z"),
        id: "history-1",
        message: "Post updated",
        metadataJson: "{}",
        method: "POST",
        path: "/dashboard/posts",
        requestId: "req-2",
        resource: "posts",
        result: "success" as const,
        statusCode: 302,
        targetId: "post-1",
        targetLabel: "Edge telemetry",
        userId: "user-1",
        userRole: "admin" as const,
      },
    ],
  },
  pagination: {
    errors: {
      direction: "next",
      hasNextPage: true,
      hasPreviousPage: false,
      nextCursor: "next-error-cursor",
      pageSize: 25,
      previousCursor: null,
    },
    history: {
      direction: "next",
      hasNextPage: false,
      hasPreviousPage: true,
      nextCursor: null,
      pageSize: 25,
      previousCursor: "previous-history-cursor",
    },
  },
  permissions: {
    canDeleteErrors: true,
    canDeleteHistory: true,
    canExportErrors: true,
    canExportHistory: true,
    canReadErrors: true,
    canReadHistory: true,
  },
  rangeForm: {
    values: {
      endAt: "",
      startAt: "",
    },
  },
  selectedTab: "history" as const,
  totals: {
    errors: 1,
    history: 1,
  },
} satisfies DashboardLoggingGrantedLoaderData;

describe("dashboard logging route", () => {
  it("renders the history view with totals and audit rows", async () => {
    const { DashboardLoggingScreen } = await import("~/routes/dashboard/logging");

    const router = createMemoryRouter(
      [
        {
          path: "/dashboard/logging",
          element: (
            <DashboardLoggingScreen
              loaderData={grantedLoaderData}
              rangeForm={grantedLoaderData.rangeForm}
            />
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/logging?tab=history"],
      },
    );

    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Audit and error logs" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Audit trail 1" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Error logs 1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download Excel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete logs" })).toBeInTheDocument();
    expect(screen.getByText("Post updated")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Previous" })).toBeInTheDocument();
  });

  it("renders the error range tools and notice when the errors tab is selected", async () => {
    const { DashboardLoggingScreen } = await import("~/routes/dashboard/logging");

    const router = createMemoryRouter(
      [
        {
          path: "/dashboard/logging",
          element: (
            <DashboardLoggingScreen
              loaderData={{
                ...grantedLoaderData,
                permissions: {
                  ...grantedLoaderData.permissions,
                  canDeleteHistory: false,
                  canExportHistory: false,
                  canReadHistory: false,
                },
                selectedTab: "errors",
              }}
              notice="2 error logs deleted."
              rangeForm={{
                errors: {
                  form: "Range invalid",
                },
                values: {
                  endAt: "2026-03-23T11:00",
                  startAt: "2026-03-23T10:00",
                },
              }}
            />
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/logging?tab=errors"],
      },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByText("2 error logs deleted.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download Excel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete logs" })).toBeInTheDocument();
    expect(screen.getByText("Range invalid")).toBeInTheDocument();
    expect(screen.getByText("Unhandled worker error")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Next" })).toBeInTheDocument();
  });

  it("hides unauthorized audit controls when the viewer only has error read access", async () => {
    const { DashboardLoggingScreen } = await import("~/routes/dashboard/logging");

    const router = createMemoryRouter(
      [
        {
          path: "/dashboard/logging",
          element: (
            <DashboardLoggingScreen
              loaderData={{
                ...grantedLoaderData,
                entries: {
                  ...grantedLoaderData.entries,
                  history: [],
                },
                permissions: {
                  canDeleteErrors: true,
                  canDeleteHistory: false,
                  canExportErrors: true,
                  canExportHistory: false,
                  canReadErrors: true,
                  canReadHistory: false,
                },
                selectedTab: "errors",
                totals: {
                  errors: 1,
                  history: 0,
                },
              }}
              rangeForm={grantedLoaderData.rangeForm}
            />
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/logging?tab=history"],
      },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByRole("link", { name: "Error logs 1" })).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Audit trail 0" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download Excel" })).toBeInTheDocument();
    expect(screen.queryByText("Post updated")).not.toBeInTheDocument();
  });

  it("renders the access denied screen for non-admin viewers", async () => {
    const { DashboardLoggingAccessDeniedScreen } =
      await import("~/routes/dashboard/logging");

    const router = createMemoryRouter(
      [
        {
          path: "/dashboard/logging",
          element: <DashboardLoggingAccessDeniedScreen viewerRole="author" />,
        },
      ],
      {
        initialEntries: ["/dashboard/logging"],
      },
    );

    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Access denied" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Session role: author")).toBeInTheDocument();
  });
});
