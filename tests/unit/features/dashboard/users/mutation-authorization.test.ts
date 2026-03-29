import { describe, expect, it } from "vitest";

import { authorizeUserMutationOrThrow } from "~/features/dashboard/users/operations/_shared/authorization.server";
import { AUTHORIZATION_CLAIM } from "~/shared/authz/model";

describe("dashboard users mutation authorization", () => {
  it("requires the claim mapped to the submitted intent", () => {
    let thrownError: unknown;

    try {
      authorizeUserMutationOrThrow({
        actor: {
          authzVersion: 1,
          claims: [AUTHORIZATION_CLAIM.usersCreate],
          role: "admin",
          userId: "user-admin",
        },
        formCopy: {
          errors: {
            createDuplicateEmail: "duplicate",
            deactivateMissingUser: "missing-delete",
            forbidden: "forbidden",
            lastActiveAdminDeactivate: "last-admin-deactivate",
            lastActiveAdminDemotion: "last-admin-demotion",
            lastActiveAdminDelete: "last-admin-delete",
            updateDuplicateEmail: "update-duplicate",
            updateMissingUser: "missing-update",
          },
        },
        intent: "delete",
      });
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toMatchObject({
      code: "users.delete.forbidden",
      details: {
        intent: "delete",
        requiredClaim: AUTHORIZATION_CLAIM.usersDelete,
      },
      responseData: {
        errors: {
          form: "forbidden",
        },
      },
      status: 403,
    });
  });

  it("allows operation handlers to proceed when the actor owns the mapped claim", () => {
    expect(() =>
      authorizeUserMutationOrThrow({
        actor: {
          authzVersion: 1,
          claims: [AUTHORIZATION_CLAIM.usersUpdate],
          role: "admin",
          userId: "user-admin",
        },
        formCopy: {
          errors: {
            createDuplicateEmail: "duplicate",
            deactivateMissingUser: "missing-delete",
            forbidden: "forbidden",
            lastActiveAdminDeactivate: "last-admin-deactivate",
            lastActiveAdminDemotion: "last-admin-demotion",
            lastActiveAdminDelete: "last-admin-delete",
            updateDuplicateEmail: "update-duplicate",
            updateMissingUser: "missing-update",
          },
        },
        intent: "update",
      }),
    ).not.toThrow();
  });
});
