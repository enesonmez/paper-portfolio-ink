import { describe, expect, it } from "vitest";

import { authorizeSkillMutationOrThrow } from "~/features/dashboard/skills/operations/_shared/authorization.server";
import { AUTHORIZATION_CLAIM } from "~/shared/authz/model";

describe("dashboard skills mutation authorization", () => {
  it("requires the claim mapped to the submitted intent", () => {
    let thrownError: unknown;

    try {
      authorizeSkillMutationOrThrow({
        actor: {
          authzVersion: 1,
          claims: [AUTHORIZATION_CLAIM.skillsCreate],
          role: "editor",
          userId: "user-editor",
        },
        formCopy: {
          errors: {
            createDuplicateSkill: "duplicate",
            deleteMissingSkill: "missing-delete",
            forbidden: "forbidden",
            updateDuplicateSkill: "update-duplicate",
            updateMissingSkill: "missing-update",
          },
        },
        intent: "delete",
      });
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toMatchObject({
      code: "skills.delete.forbidden",
      details: {
        intent: "delete",
        requiredClaim: AUTHORIZATION_CLAIM.skillsDelete,
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
      authorizeSkillMutationOrThrow({
        actor: {
          authzVersion: 1,
          claims: [AUTHORIZATION_CLAIM.skillsUpdate],
          role: "editor",
          userId: "user-editor",
        },
        formCopy: {
          errors: {
            createDuplicateSkill: "duplicate",
            deleteMissingSkill: "missing-delete",
            forbidden: "forbidden",
            updateDuplicateSkill: "update-duplicate",
            updateMissingSkill: "missing-update",
          },
        },
        intent: "update",
      }),
    ).not.toThrow();
  });
});
