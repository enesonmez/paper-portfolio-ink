import { describe, expect, it } from "vitest";

import {
  buildDashboardUsersHref,
  buildDashboardUsersMetrics,
  mergeDashboardUsersAuthorizationFormState,
  mergeDashboardUsersProfileFormState,
  resolveDashboardUsersAuthorizationForm,
  resolveDashboardUsersProfileForm,
} from "~/features/dashboard/users/state";

describe("dashboard users state helpers", () => {
  it("builds hrefs and preserves dashboard metrics", () => {
    expect(buildDashboardUsersHref({ modal: "create" })).toBe(
      "/dashboard/users?modal=create",
    );
    expect(buildDashboardUsersHref({ editId: "user-1", modal: "access" })).toBe(
      "/dashboard/users?modal=access&edit=user-1",
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

  it("resolves profile form state and merges action values", () => {
    const loaderForm = resolveDashboardUsersProfileForm({
      editId: "user-1",
      modal: "edit",
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
      mergeDashboardUsersProfileFormState(loaderForm, {
        profileForm: {
          editingUserId: "user-1",
          errors: {
            email: "Already taken",
          },
          isOpen: true,
          mode: "edit",
          values: {
            avatarUrl: "",
            bio: "",
            displayName: "Admin",
            email: "admin@example.com",
            isActive: true,
            password: "",
            role: "admin",
          },
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

  it("resolves authorization modal state and keeps claim entries while merging errors", () => {
    const loaderForm = resolveDashboardUsersAuthorizationForm({
      authorizationUser: {
        authzVersion: 7,
        displayName: "Admin",
        email: "admin@example.com",
        id: "user-1",
        isActive: true,
        overrides: [
          {
            claimKey: "users.delete",
            effect: "revoke",
          },
        ],
        role: "admin",
      },
      modal: "access",
    });

    expect(loaderForm).toMatchObject({
      authzVersion: 7,
      editingUserEmail: "admin@example.com",
      editingUserId: "user-1",
      editingUserName: "Admin",
      isOpen: true,
      mode: "access",
      values: {
        authzVersion: "7",
        role: "admin",
      },
    });
    expect(
      loaderForm.claims.find((claim) => claim.claimKey === "users.delete"),
    ).toMatchObject({
      effect: "revoke",
      isEffective: false,
      isRoleGranted: true,
    });

    expect(
      mergeDashboardUsersAuthorizationFormState(loaderForm, {
        authorizationForm: {
          editingUserId: "user-1",
          errors: {
            form: "Stale version",
          },
          isOpen: true,
          mode: "access",
          values: {
            authzVersion: "7",
            claimKey: "users.delete",
            role: "admin",
          },
        },
      }),
    ).toMatchObject({
      authzVersion: 7,
      editingUserId: "user-1",
      errors: {
        form: "Stale version",
      },
      isOpen: true,
      mode: "access",
    });
  });
});
