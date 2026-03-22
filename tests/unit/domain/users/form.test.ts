import { describe, expect, it } from "vitest";

import { buildUserFormValues, getDefaultUserFormValues } from "~/domain/users/form";

describe("user form values", () => {
  it("provides stable defaults for new user forms", () => {
    expect(getDefaultUserFormValues()).toEqual({
      avatarUrl: "",
      bio: "",
      displayName: "",
      email: "",
      isActive: true,
      password: "",
      role: "author",
    });
  });

  it("merges partial values over defaults", () => {
    expect(
      buildUserFormValues({
        displayName: "Enes Sonmez",
        email: "enes@example.com",
        role: "admin",
      }),
    ).toMatchObject({
      displayName: "Enes Sonmez",
      email: "enes@example.com",
      isActive: true,
      role: "admin",
    });
  });
});
