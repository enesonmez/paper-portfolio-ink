import { describe, expect, it } from "vitest";

import { authorizeProjectMutationOrThrow } from "~/features/dashboard/projects/operations/_shared/authorization.server";
import { AUTHORIZATION_CLAIM } from "~/shared/authz/model";

describe("dashboard projects mutation authorization", () => {
  it("requires the claim mapped to the submitted intent", () => {
    let thrownError: unknown;

    try {
      authorizeProjectMutationOrThrow({
        actor: {
          authzVersion: 1,
          claims: [AUTHORIZATION_CLAIM.projectsCreate],
          role: "author",
          userId: "user-author",
        },
        formCopy: {
          errors: {
            deleteMissingProject: "missing-delete",
            forbidden: "forbidden",
            updateMissingProject: "missing-update",
          },
        },
        intent: "delete",
      });
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toMatchObject({
      code: "projects.delete.forbidden",
      details: {
        intent: "delete",
        requiredClaim: AUTHORIZATION_CLAIM.projectsDelete,
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
      authorizeProjectMutationOrThrow({
        actor: {
          authzVersion: 1,
          claims: [AUTHORIZATION_CLAIM.projectsUpdate],
          role: "author",
          userId: "user-author",
        },
        formCopy: {
          errors: {
            deleteMissingProject: "missing-delete",
            forbidden: "forbidden",
            updateMissingProject: "missing-update",
          },
        },
        intent: "update",
      }),
    ).not.toThrow();
  });
});
