import { describe, expect, it } from "vitest";

import { authorizeLoggingMutationOrThrow } from "~/features/dashboard/logging/operations/_shared/authorization.server";

describe("dashboard logging mutation authorization", () => {
  it("requires both read and export permissions for export intent", () => {
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

  it("requires both read and delete permissions for delete intent", () => {
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

  it("splits audit and error mutation claims while requiring the matching read claim", () => {
    expect(() => {
      authorizeLoggingMutationOrThrow({
        actor: {
          authzVersion: 1,
          claims: ["logs.error.read", "logs.error.export"],
          role: "author",
          userId: "user-author",
        },
        forbiddenMessage: "forbidden",
        intent: "export-history",
      });
    }).toThrowErrorMatchingInlineSnapshot(
      `[AuthorizationError: Logging mutation denied by authorization policy]`,
    );

    expect(() => {
      authorizeLoggingMutationOrThrow({
        actor: {
          authzVersion: 1,
          claims: ["logs.error.read", "logs.error.delete"],
          role: "author",
          userId: "user-author",
        },
        forbiddenMessage: "forbidden",
        intent: "delete-history",
      });
    }).toThrowErrorMatchingInlineSnapshot(
      `[AuthorizationError: Logging mutation denied by authorization policy]`,
    );

    expect(() => {
      authorizeLoggingMutationOrThrow({
        actor: {
          authzVersion: 1,
          claims: ["logs.audit.read", "logs.audit.export"],
          role: "author",
          userId: "user-author",
        },
        forbiddenMessage: "forbidden",
        intent: "export-history",
      });
    }).not.toThrow();

    expect(() => {
      authorizeLoggingMutationOrThrow({
        actor: {
          authzVersion: 1,
          claims: ["logs.audit.read", "logs.audit.delete"],
          role: "author",
          userId: "user-author",
        },
        forbiddenMessage: "forbidden",
        intent: "delete-history",
      });
    }).not.toThrow();

    expect(() => {
      authorizeLoggingMutationOrThrow({
        actor: {
          authzVersion: 1,
          claims: ["logs.audit.export"],
          role: "author",
          userId: "user-author",
        },
        forbiddenMessage: "forbidden",
        intent: "export-history",
      });
    }).toThrowErrorMatchingInlineSnapshot(
      `[AuthorizationError: Logging mutation denied by authorization policy]`,
    );
  });
});
