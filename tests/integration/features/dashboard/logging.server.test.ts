import type { AppLoadContext } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  deleteLogErrorHistoryEntriesByDateRangeMock,
  formatLogErrorHistoryExportMock,
  listLogErrorHistoryEntriesAscendingMock,
  loadDashboardLoggingOverviewMock,
  parseLoggingRangeFormDataMock,
  recordAuditLogMock,
  requireSessionMock,
} = vi.hoisted(() => ({
  deleteLogErrorHistoryEntriesByDateRangeMock: vi.fn(),
  formatLogErrorHistoryExportMock: vi.fn(),
  listLogErrorHistoryEntriesAscendingMock: vi.fn(),
  loadDashboardLoggingOverviewMock: vi.fn(),
  parseLoggingRangeFormDataMock: vi.fn(),
  recordAuditLogMock: vi.fn(),
  requireSessionMock: vi.fn(),
}));

vi.mock("~/lib/logging/logs.server", () => ({
  deleteLogErrorHistoryEntriesByDateRange: deleteLogErrorHistoryEntriesByDateRangeMock,
  formatLogErrorHistoryExport: formatLogErrorHistoryExportMock,
  listLogErrorHistoryEntriesAscending: listLogErrorHistoryEntriesAscendingMock,
  loadDashboardLoggingOverview: loadDashboardLoggingOverviewMock,
}));

vi.mock("~/lib/logging/logging-range-form.server", () => ({
  parseLoggingRangeFormData: parseLoggingRangeFormDataMock,
}));

vi.mock("~/shared/auth/session.server", () => ({
  requireSession: requireSessionMock,
}));

vi.mock("~/shared/logging/audit.server", () => ({
  recordAuditLog: recordAuditLogMock,
}));

describe("dashboard logging server", () => {
  const context = {
    cache: {
      delete: vi.fn(),
      get: vi.fn(),
      set: vi.fn(),
    },
    db: { query: {} } as never,
    runtime: { platform: "node" },
  } as unknown as AppLoadContext;

  beforeEach(() => {
    deleteLogErrorHistoryEntriesByDateRangeMock.mockReset();
    formatLogErrorHistoryExportMock.mockReset();
    listLogErrorHistoryEntriesAscendingMock.mockReset();
    loadDashboardLoggingOverviewMock.mockReset();
    parseLoggingRangeFormDataMock.mockReset();
    recordAuditLogMock.mockReset();
    requireSessionMock.mockReset();
  });

  it("loads the logging overview for admin sessions", async () => {
    const { loadDashboardLoggingData } =
      await import("~/features/dashboard/logging/server");

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-admin",
        role: "admin",
      },
    });
    loadDashboardLoggingOverviewMock.mockResolvedValue({
      errorEntries: [
        {
          code: "logging.error",
          createdAt: new Date("2026-03-23T09:00:00.000Z"),
          id: "error-1",
          message: "Unhandled worker error",
          path: "/dashboard/posts",
          requestId: "req-1",
          severity: "error",
        },
      ],
      historyEntries: [
        {
          action: "update",
          createdAt: new Date("2026-03-23T08:00:00.000Z"),
          id: "history-1",
          message: "Post updated",
          path: "/dashboard/posts",
          result: "success",
          userId: "user-admin",
          userRole: "admin",
        },
      ],
      totals: {
        errorCount: 1,
        historyCount: 1,
      },
    });

    const response = await loadDashboardLoggingData(
      context,
      new Request("http://localhost:3000/dashboard/logging?tab=errors"),
    );

    if (response instanceof Response) {
      throw new Error("Expected granted logging loader data");
    }

    expect(response).toMatchObject({
      access: "granted",
      permissions: {
        canDelete: true,
        canExport: true,
      },
      selectedTab: "errors",
      totals: {
        errors: 1,
        history: 1,
      },
    });
  });

  it("returns denied loader data for sessions without logging access", async () => {
    const { loadDashboardLoggingData } =
      await import("~/features/dashboard/logging/server");

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-author",
        role: "author",
      },
    });

    await expect(
      loadDashboardLoggingData(
        context,
        new Request("http://localhost:3000/dashboard/logging"),
      ),
    ).rejects.toMatchObject({
      code: "logging.read.forbidden",
      responseData: {
        access: "denied",
      },
      status: 403,
    });
    expect(loadDashboardLoggingOverviewMock).not.toHaveBeenCalled();
  });

  it("exports error logs for an authorized admin session", async () => {
    const { handleDashboardLoggingAction } =
      await import("~/features/dashboard/logging/server");

    const request = new Request("http://localhost:3000/dashboard/logging", {
      body: new URLSearchParams({
        endAt: "2026-03-29T20:00",
        intent: "export-errors",
        startAt: "2026-03-29T19:00",
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-admin",
        role: "admin",
      },
    });
    parseLoggingRangeFormDataMock.mockReturnValue({
      endAt: new Date("2026-03-29T17:00:00.000Z"),
      intent: "export-errors",
      startAt: new Date("2026-03-29T16:00:00.000Z"),
      values: {
        endAt: "2026-03-29T20:00",
        startAt: "2026-03-29T19:00",
      },
    });
    listLogErrorHistoryEntriesAscendingMock.mockResolvedValue([
      {
        code: "logging.error",
        createdAt: new Date("2026-03-29T16:30:00.000Z"),
        message: "Unhandled worker error",
      },
    ]);
    formatLogErrorHistoryExportMock.mockReturnValue("formatted-export");

    const response = await handleDashboardLoggingAction(context, request);

    if (!(response instanceof Response)) {
      throw new Error("Expected export response");
    }

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe("formatted-export");
    expect(recordAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "export",
        targetLabel: "error-log-export",
      }),
    );
  });

  it("returns a 403 form error for sessions without export permission", async () => {
    const { handleDashboardLoggingAction } =
      await import("~/features/dashboard/logging/server");

    const request = new Request("http://localhost:3000/dashboard/logging", {
      body: new URLSearchParams({
        endAt: "2026-03-29T20:00",
        intent: "export-errors",
        startAt: "2026-03-29T19:00",
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });

    requireSessionMock.mockResolvedValue({
      user: {
        claims: [],
        id: "user-operator",
        role: "author",
      },
    });
    parseLoggingRangeFormDataMock.mockReturnValue({
      endAt: new Date("2026-03-29T17:00:00.000Z"),
      intent: "export-errors",
      startAt: new Date("2026-03-29T16:00:00.000Z"),
      values: {
        endAt: "2026-03-29T20:00",
        startAt: "2026-03-29T19:00",
      },
    });

    await expect(handleDashboardLoggingAction(context, request)).rejects.toMatchObject({
      code: "logging.export.forbidden",
      responseData: {
        rangeForm: {
          errors: {
            form: "Bu islemi gerceklestirme yetkiniz bulunmuyor.",
          },
          values: {
            endAt: "",
            startAt: "",
          },
        },
      },
      status: 403,
    });
    expect(listLogErrorHistoryEntriesAscendingMock).not.toHaveBeenCalled();
  });

  it("exports error logs when the session only has the export claim", async () => {
    const { handleDashboardLoggingAction } =
      await import("~/features/dashboard/logging/server");

    const request = new Request("http://localhost:3000/dashboard/logging", {
      body: new URLSearchParams({
        endAt: "2026-03-29T20:00",
        intent: "export-errors",
        startAt: "2026-03-29T19:00",
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });

    requireSessionMock.mockResolvedValue({
      user: {
        claims: ["logs.export"],
        id: "user-exporter",
        role: "author",
      },
    });
    parseLoggingRangeFormDataMock.mockReturnValue({
      endAt: new Date("2026-03-29T17:00:00.000Z"),
      intent: "export-errors",
      startAt: new Date("2026-03-29T16:00:00.000Z"),
      values: {
        endAt: "2026-03-29T20:00",
        startAt: "2026-03-29T19:00",
      },
    });
    listLogErrorHistoryEntriesAscendingMock.mockResolvedValue([]);
    formatLogErrorHistoryExportMock.mockReturnValue("formatted-export");

    const response = await handleDashboardLoggingAction(context, request);

    if (!(response instanceof Response)) {
      throw new Error("Expected export response");
    }

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe("formatted-export");
  });

  it("returns a 403 form error for sessions without delete permission", async () => {
    const { handleDashboardLoggingAction } =
      await import("~/features/dashboard/logging/server");

    const request = new Request("http://localhost:3000/dashboard/logging", {
      body: new URLSearchParams({
        endAt: "2026-03-29T20:00",
        intent: "delete-errors",
        startAt: "2026-03-29T19:00",
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });

    requireSessionMock.mockResolvedValue({
      user: {
        claims: [],
        id: "user-operator",
        role: "author",
      },
    });
    parseLoggingRangeFormDataMock.mockReturnValue({
      endAt: new Date("2026-03-29T17:00:00.000Z"),
      intent: "delete-errors",
      startAt: new Date("2026-03-29T16:00:00.000Z"),
      values: {
        endAt: "2026-03-29T20:00",
        startAt: "2026-03-29T19:00",
      },
    });

    await expect(handleDashboardLoggingAction(context, request)).rejects.toMatchObject({
      code: "logging.delete.forbidden",
      responseData: {
        rangeForm: {
          errors: {
            form: "Bu islemi gerceklestirme yetkiniz bulunmuyor.",
          },
          values: {
            endAt: "",
            startAt: "",
          },
        },
      },
      status: 403,
    });
    expect(deleteLogErrorHistoryEntriesByDateRangeMock).not.toHaveBeenCalled();
  });

  it("deletes error logs when the session only has the delete claim", async () => {
    const { handleDashboardLoggingAction } =
      await import("~/features/dashboard/logging/server");

    const request = new Request("http://localhost:3000/dashboard/logging", {
      body: new URLSearchParams({
        endAt: "2026-03-29T20:00",
        intent: "delete-errors",
        startAt: "2026-03-29T19:00",
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });

    requireSessionMock.mockResolvedValue({
      user: {
        claims: ["logs.delete"],
        id: "user-cleaner",
        role: "author",
      },
    });
    parseLoggingRangeFormDataMock.mockReturnValue({
      endAt: new Date("2026-03-29T17:00:00.000Z"),
      intent: "delete-errors",
      startAt: new Date("2026-03-29T16:00:00.000Z"),
      values: {
        endAt: "2026-03-29T20:00",
        startAt: "2026-03-29T19:00",
      },
    });
    deleteLogErrorHistoryEntriesByDateRangeMock.mockResolvedValue(1);

    await expect(handleDashboardLoggingAction(context, request)).resolves.toMatchObject(
      {
        notice: "1 hata logu silindi.",
      },
    );
  });

  it("deletes error logs and returns a success notice", async () => {
    const { handleDashboardLoggingAction } =
      await import("~/features/dashboard/logging/server");

    const request = new Request("http://localhost:3000/dashboard/logging", {
      body: new URLSearchParams({
        endAt: "2026-03-29T20:00",
        intent: "delete-errors",
        startAt: "2026-03-29T19:00",
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-admin",
        role: "admin",
      },
    });
    parseLoggingRangeFormDataMock.mockReturnValue({
      endAt: new Date("2026-03-29T17:00:00.000Z"),
      intent: "delete-errors",
      startAt: new Date("2026-03-29T16:00:00.000Z"),
      values: {
        endAt: "2026-03-29T20:00",
        startAt: "2026-03-29T19:00",
      },
    });
    deleteLogErrorHistoryEntriesByDateRangeMock.mockResolvedValue(2);

    await expect(handleDashboardLoggingAction(context, request)).resolves.toMatchObject(
      {
        notice: "2 hata logu silindi.",
        rangeForm: {
          values: {
            endAt: "",
            startAt: "",
          },
        },
      },
    );
    expect(recordAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "delete",
        targetLabel: "error-log-delete",
      }),
    );
  });

  it("rejects unsupported intents before authorization resolves", async () => {
    const { handleDashboardLoggingAction } =
      await import("~/features/dashboard/logging/server");

    const request = new Request("http://localhost:3000/dashboard/logging", {
      body: new URLSearchParams({
        endAt: "2026-03-29T20:00",
        intent: "archive-errors",
        startAt: "2026-03-29T19:00",
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });

    await expect(handleDashboardLoggingAction(context, request)).rejects.toMatchObject({
      code: "logging.mutation.invalid_intent",
      details: {
        intent: "archive-errors",
      },
      responseData: {
        rangeForm: {
          errors: {
            form: "Bu islemi gerceklestirme yetkiniz bulunmuyor.",
          },
          values: {
            endAt: "",
            startAt: "",
          },
        },
      },
      status: 400,
    });
    expect(requireSessionMock).not.toHaveBeenCalled();
    expect(parseLoggingRangeFormDataMock).not.toHaveBeenCalled();
    expect(deleteLogErrorHistoryEntriesByDateRangeMock).not.toHaveBeenCalled();
    expect(listLogErrorHistoryEntriesAscendingMock).not.toHaveBeenCalled();
  });
});
