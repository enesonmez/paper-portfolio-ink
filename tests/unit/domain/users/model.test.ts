import { describe, expect, it } from "vitest";

import {
  USER_FORM_FIELD,
  USER_MUTATION_INTENT,
  USER_ROLE_VALUES,
  buildUserRoleOptions,
  isUserMutationIntent,
} from "~/domain/users/model";
import { createTranslator, getSeedMessages } from "~/shared/i18n/i18n.shared";

const t = createTranslator(getSeedMessages("tr"));

describe("user model contracts", () => {
  it("exposes stable role options and constants", () => {
    expect(USER_ROLE_VALUES).toEqual(["admin", "author"]);
    expect(buildUserRoleOptions(t)).toEqual([
      {
        label: t("model.userRole.admin"),
        value: "admin",
      },
      {
        label: t("model.userRole.author"),
        value: "author",
      },
    ]);
  });

  it("keeps mutation intents and field names stable", () => {
    expect(USER_MUTATION_INTENT).toEqual({
      create: "create",
      delete: "delete",
      grantClaim: "grant-claim",
      revokeClaim: "revoke-claim",
      update: "update",
      updateAccessRole: "update-access-role",
    });
    expect(USER_FORM_FIELD).toMatchObject({
      authzVersion: "authzVersion",
      claimKey: "claimKey",
      email: "email",
      intent: "intent",
      userId: "userId",
    });
  });

  it("recognizes only supported mutation intents", () => {
    expect(isUserMutationIntent("create")).toBe(true);
    expect(isUserMutationIntent("update")).toBe(true);
    expect(isUserMutationIntent("delete")).toBe(true);
    expect(isUserMutationIntent("grant-claim")).toBe(true);
    expect(isUserMutationIntent("revoke-claim")).toBe(true);
    expect(isUserMutationIntent("update-access-role")).toBe(true);
    expect(isUserMutationIntent("archive")).toBe(false);
  });
});
