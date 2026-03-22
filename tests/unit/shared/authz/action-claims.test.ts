import { describe, expect, it } from "vitest";

import {
  PROJECT_MUTATION_CLAIMS,
  RESOURCE_MUTATION_CLAIMS,
  resolveMutationClaim,
} from "~/shared/authz/action-claims";
import { AUTHORIZATION_CLAIM } from "~/shared/authz/model";

describe("authorization action claims", () => {
  it("resolves mapped CRUD claims for known intents", () => {
    expect(
      resolveMutationClaim(
        "update",
        PROJECT_MUTATION_CLAIMS,
        AUTHORIZATION_CLAIM.projectsCreate,
      ),
    ).toBe(AUTHORIZATION_CLAIM.projectsUpdate);
  });

  it("falls back to the provided claim when the intent is unknown", () => {
    expect(
      resolveMutationClaim(
        "unknown",
        RESOURCE_MUTATION_CLAIMS,
        AUTHORIZATION_CLAIM.resourcesTranslationsDelete,
      ),
    ).toBe(AUTHORIZATION_CLAIM.resourcesTranslationsDelete);
  });
});
