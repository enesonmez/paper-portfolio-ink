import { describe, expect, it } from "vitest";

import { authorizeLoggingMutationOrThrow } from "~/features/dashboard/logging/operations/_shared/authorization.server";

describe("dashboard logging mutation authorization", () => {
  it("requires export permission for export intent", () => {
    expect(() => {
      authorizeLoggingMutationOrThrow({
        actor: {
          authzVersion: 1,
          claims: [],
          role: "author",
          userId: "user-author",
        },
        forbiddenMessage: "forbidden",
        intent: "export-errors",
      });
    }).toThrowErrorMatchingInlineSnapshot(
      `[AuthorizationError: Logging mutation denied by authorization policy]`,
    );

    try {
      authorizeLoggingMutationOrThrow({
        actor: {
          authzVersion: 1,
          claims: [],
          role: "author",
          userId: "user-author",
        },
        forbiddenMessage: "forbidden",
        intent: "export-errors",
      });
    } catch (error) {
      expect(error).toMatchObject({
        code: "logging.export.forbidden",
        responseData: {
          rangeForm: {
            errors: {
              form: "forbidden",
            },
            values: {
              endAt: "",
              startAt: "",
            },
          },
        },
        status: 403,
      });
    }
  });

  it("requires delete permission for delete intent", () => {
    expect(() => {
      authorizeLoggingMutationOrThrow({
        actor: {
          authzVersion: 1,
          claims: [],
          role: "author",
          userId: "user-author",
        },
        forbiddenMessage: "forbidden",
        intent: "delete-errors",
      });
    }).toThrowErrorMatchingInlineSnapshot(
      `[AuthorizationError: Logging mutation denied by authorization policy]`,
    );

    try {
      authorizeLoggingMutationOrThrow({
        actor: {
          authzVersion: 1,
          claims: [],
          role: "author",
          userId: "user-author",
        },
        forbiddenMessage: "forbidden",
        intent: "delete-errors",
      });
    } catch (error) {
      expect(error).toMatchObject({
        code: "logging.delete.forbidden",
        responseData: {
          rangeForm: {
            errors: {
              form: "forbidden",
            },
            values: {
              endAt: "",
              startAt: "",
            },
          },
        },
        status: 403,
      });
    }
  });
});
