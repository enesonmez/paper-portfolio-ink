import { describe, expect, it } from "vitest";

import {
  APP_ERROR_CATEGORY,
  APP_ERROR_SEVERITY,
  APP_ERROR_SINK,
  AuthorizationError,
  ValidationError,
  isAppError,
  isAppErrorReported,
  markAppErrorReported,
  normalizeAppError,
} from "~/shared/errors/app-error.server";
import { APP_ERROR_CODE } from "~/shared/errors/contracts";

describe("app error", () => {
  it("preserves typed metadata for expected errors", () => {
    const error = new ValidationError("Invalid project payload", {
      code: APP_ERROR_CODE.projects.validation,
      details: {
        field: "title",
      },
      expose: true,
      logSink: APP_ERROR_SINK.logHistory,
      responseData: {
        errors: {
          title: "Required",
        },
      },
      severity: APP_ERROR_SEVERITY.info,
      status: 400,
    });

    expect(error.category).toBe(APP_ERROR_CATEGORY.validation);
    expect(error.code).toBe(APP_ERROR_CODE.projects.validation);
    expect(error.status).toBe(400);
    expect(error.responseData).toEqual({
      errors: {
        title: "Required",
      },
    });
    expect(isAppError(error)).toBe(true);
  });

  it("marks reported app errors to avoid duplicate logging", () => {
    const error = new AuthorizationError("Forbidden", {
      code: APP_ERROR_CODE.logging.read.forbidden,
      expose: true,
      logSink: APP_ERROR_SINK.logHistory,
      severity: APP_ERROR_SEVERITY.warn,
      status: 403,
    });

    expect(isAppErrorReported(error)).toBe(false);
    markAppErrorReported(error);
    expect(isAppErrorReported(error)).toBe(true);
  });

  it("normalizes unknown failures into internal server errors", () => {
    const error = normalizeAppError(new Error("boom"));

    expect(error.category).toBe(APP_ERROR_CATEGORY.internal);
    expect(error.code).toBe(APP_ERROR_CODE.internal.unexpected);
    expect(error.status).toBe(500);
    expect(error.expose).toBe(false);
  });
});
