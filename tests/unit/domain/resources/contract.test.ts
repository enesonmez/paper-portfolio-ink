import { describe, expect, it } from "vitest";

import {
  RESOURCE_FORM_FIELD,
  RESOURCE_MUTATION_INTENT,
  isResourceMutationIntent,
} from "~/domain/resources/contract";

describe("resource contracts", () => {
  it("keeps mutation intent constants stable", () => {
    expect(RESOURCE_MUTATION_INTENT).toEqual({
      createLocale: "create-locale",
      createTranslation: "create-translation",
      deleteLocale: "delete-locale",
      deleteTranslation: "delete-translation",
      updateLocale: "update-locale",
      updateTranslation: "update-translation",
    });
  });

  it("keeps resource form field names stable", () => {
    expect(RESOURCE_FORM_FIELD).toMatchObject({
      code: "code",
      intent: "intent",
      locale: "locale",
      key: "key",
      originalCode: "originalCode",
      originalKey: "originalKey",
      originalLocale: "originalLocale",
      value: "value",
    });
  });

  it("identifies supported mutation intents", () => {
    expect(isResourceMutationIntent("create-locale")).toBe(true);
    expect(isResourceMutationIntent("delete-translation")).toBe(true);
    expect(isResourceMutationIntent("archive-locale")).toBe(false);
  });
});
