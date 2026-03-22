import { describe, expect, it } from "vitest";

import { buildLoginFormValues, mergeLoginFormState } from "~/features/auth/login/state";

describe("login state helpers", () => {
  it("builds default login form values with dashboard redirect fallback", () => {
    expect(buildLoginFormValues()).toEqual({
      email: "",
      redirectTo: "/dashboard",
    });
  });

  it("merges action data while preserving the loader redirect target", () => {
    expect(
      mergeLoginFormState("/dashboard/posts", {
        errors: {
          email: "Invalid email",
        },
        values: {
          email: "admin@example.com",
          redirectTo: "",
        },
      }),
    ).toEqual({
      errors: {
        email: "Invalid email",
      },
      values: {
        email: "admin@example.com",
        redirectTo: "",
      },
    });

    expect(mergeLoginFormState("/dashboard/posts")).toEqual({
      errors: undefined,
      values: {
        email: undefined,
        redirectTo: "/dashboard/posts",
      },
    });
  });
});
