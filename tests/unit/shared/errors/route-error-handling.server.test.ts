import { describe, expect, it, vi } from "vitest";

const { reportAppErrorMock } = vi.hoisted(() => {
  return {
    reportAppErrorMock: vi.fn(),
  };
});

vi.mock("~/shared/errors/report.server", () => {
  return {
    reportAppError: reportAppErrorMock,
  };
});

describe("route error handling", () => {
  it("returns response data for handled validation errors", async () => {
    const { ValidationError, APP_ERROR_SEVERITY, APP_ERROR_SINK } =
      await import("~/shared/errors/app-error.server");
    const { runActionWithErrorHandling } =
      await import("~/shared/errors/route-error-handling.server");

    reportAppErrorMock.mockResolvedValueOnce(
      new ValidationError("Invalid", {
        code: "projects.validation",
        expose: true,
        logSink: APP_ERROR_SINK.logHistory,
        responseData: {
          errors: {
            title: "Required",
          },
        },
        severity: APP_ERROR_SEVERITY.info,
        status: 400,
      }),
    );

    const response = await runActionWithErrorHandling({
      context: { db: {} } as never,
      handler: () => {
        throw new ValidationError("Invalid", {
          code: "projects.validation",
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
      },
      request: new Request("https://example.com/tr/dashboard/projects", {
        method: "POST",
      }),
      routeId: "dashboard.projects",
    });

    expect(response).toMatchObject({
      init: {
        status: 400,
      },
    });
    expect(response).toMatchObject({
      data: {
        errors: {
          title: "Required",
        },
      },
    });
  });

  it("throws a generic payload for unexpected errors", async () => {
    const { InternalServerError, APP_ERROR_SEVERITY, APP_ERROR_SINK } =
      await import("~/shared/errors/app-error.server");
    const { runLoaderWithErrorHandling } =
      await import("~/shared/errors/route-error-handling.server");

    reportAppErrorMock.mockResolvedValueOnce(
      new InternalServerError("Unexpected application error", {
        code: "internal.unexpected",
        expose: false,
        logSink: APP_ERROR_SINK.logErrorHistory,
        severity: APP_ERROR_SEVERITY.error,
        status: 500,
      }),
    );

    await expect(
      runLoaderWithErrorHandling({
        context: { db: {} } as never,
        handler: () => {
          throw new Error("boom");
        },
        request: new Request("https://example.com/tr/blog"),
        routeId: "public.blog.index",
      }),
    ).rejects.toMatchObject({
      data: {
        error: {
          code: "internal.unexpected",
          message: "Unexpected application error.",
          requestId: null,
          status: 500,
        },
      },
      init: {
        status: 500,
      },
    });
  });
});
