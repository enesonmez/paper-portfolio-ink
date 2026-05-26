import { describe, expect, it } from "vitest";

import {
  buildDashboardUsersHref,
  buildDashboardUsersMetrics,
  mergeDashboardUsersFormState,
  resolveDashboardUsersForm,
} from "~/features/dashboard/users/state";

describe("dashboard users state helpers", () => {
  it("builds hrefs and counts only active users in dashboard metrics", () => {
    expect(buildDashboardUsersHref({ modal: "create" })).toBe(
      "/dashboard/users?modal=create",
    );
    expect(
      buildDashboardUsersMetrics({
        adminCount: 2,
        authorCount: 1,
        totalCount: 3,
      }),
    ).toEqual({
      adminCount: 2,
      authorCount: 1,
      totalCount: 3,
    });
  });

  it("resolves edit form state and merges action values", () => {
    const loaderForm = resolveDashboardUsersForm({
      editId: "user-1",
      modal: null,
      users: [
        {
          avatarUrl: "https://images.paper-portfolio-ink.dev/admin.webp",
          bio: "Edge admin",
          createdAtLabel: "2026-03-20",
          displayName: "Admin",
          email: "admin@example.com",
          id: "user-1",
          isActive: true,
          role: "admin",
          updatedAtLabel: "2026-03-20",
        },
      ],
    });

    expect(loaderForm).toMatchObject({
      editingUserId: "user-1",
      isOpen: true,
      mode: "edit",
      values: {
        avatarUrl: "https://images.paper-portfolio-ink.dev/admin.webp",
        bio: "Edge admin",
        displayName: "Admin",
        email: "admin@example.com",
        isActive: true,
        role: "admin",
      },
    });

    expect(
      mergeDashboardUsersFormState(loaderForm, {
        errors: {
          email: "Already taken",
        },
        values: {
          avatarUrl: "",
          bio: "",
          displayName: "Admin",
          email: "admin@example.com",
          isActive: true,
          password: "",
          role: "admin",
        },
      }),
    ).toMatchObject({
      editingUserId: "user-1",
      errors: {
        email: "Already taken",
      },
      isOpen: true,
      mode: "edit",
    });
  });
});
