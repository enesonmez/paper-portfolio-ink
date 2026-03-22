import { describe, expect, it } from "vitest";

import { compactFieldErrors, readStringField } from "~/shared/forms/form-data.server";

describe("form data helpers", () => {
  it("reads string values and falls back to an empty string", () => {
    const formData = new FormData();

    formData.set("title", "Paper");
    formData.set("count", "4");

    expect(readStringField(formData, "title")).toBe("Paper");
    expect(readStringField(formData, "missing")).toBe("");
  });

  it("removes undefined field errors", () => {
    expect(
      compactFieldErrors({
        email: "Already taken",
        password: undefined,
      }),
    ).toEqual({
      email: "Already taken",
    });
  });
});
