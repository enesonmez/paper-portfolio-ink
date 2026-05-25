import type { AppLoadContext } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  deleteLogHistoryEntriesByDateRangeMock,
  deleteLogErrorHistoryEntriesByDateRangeMock,
  listLogErrorHistoryEntriesAscendingMock,
  listLogHistoryEntriesAscendingMock,
  loadDashboardLoggingOverviewMock,
  parseLoggingRangeFormDataMock,
  parseLoggingRangeSearchParamsMock,
  recordAuditLogMock,
  requireSessionMock,
} = vi.hoisted(() => ({
  deleteLogHistoryEntriesByDateRangeMock: vi.fn(),
  deleteLogErrorHistoryEntriesByDateRangeMock: vi.fn(),
  listLogErrorHistoryEntriesAscendingMock: vi.fn(),
  listLogHistoryEntriesAscendingMock: vi.fn(),
  loadDashboardLoggingOverviewMock: vi.fn(),
  parseLoggingRangeFormDataMock: vi.fn(),
  parseLoggingRangeSearchParamsMock: vi.fn(),
  recordAuditLogMock: vi.fn(),
  requireSessionMock: vi.fn(),
}));

vi.mock("~/lib/logging/logs.server", () => ({
  DASHBOARD_LOGGING_EXPORT_MAX_ROWS: 1000,
  deleteLogHistoryEntriesByDateRange: deleteLogHistoryEntriesByDateRangeMock,
  deleteLogErrorHistoryEntriesByDateRange: deleteLogErrorHistoryEntriesByDateRangeMock,
  listLogErrorHistoryEntriesAscending: listLogErrorHistoryEntriesAscendingMock,
  listLogHistoryEntriesAscending: listLogHistoryEntriesAscendingMock,
  loadDashboardLoggingOverview: loadDashboardLoggingOverviewMock,
}));

vi.mock("~/lib/logging/logging-range-form.server", () => ({
  parseLoggingRangeFormData: parseLoggingRangeFormDataMock,
  parseLoggingRangeSearchParams: parseLoggingRangeSearchParamsMock,
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
    deleteLogHistoryEntriesByDateRangeMock.mockReset();
    deleteLogErrorHistoryEntriesByDateRangeMock.mockReset();
    listLogErrorHistoryEntriesAscendingMock.mockReset();
    listLogHistoryEntriesAscendingMock.mockReset();
    loadDashboardLoggingOverviewMock.mockReset();
    parseLoggingRangeFormDataMock.mockReset();
    parseLoggingRangeSearchParamsMock.mockReset();
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
      errorPage: {
        entries: [
          {
            category: "server",
            code: "logging.error",
            createdAt: new Date("2026-03-23T09:00:00.000Z"),
            fingerprint: "fingerprint-1",
            id: "error-1",
            locale: "en",
            message: "Unhandled worker error",
            metadataJson: "{}",
            method: "POST",
            path: "/dashboard/posts",
            requestId: "req-1",
            routeId: "dashboard.posts",
            severity: "error",
            stack: null,
            statusCode: 500,
            userId: "user-admin",
            userRole: "admin",
          },
        ],
        pagination: {
          direction: "next",
          hasNextPage: true,
          hasPreviousPage: false,
          nextCursor: "next-error",
          pageSize: 25,
          previousCursor: null,
        },
      },
      historyPage: {
        entries: [
          {
            action: "update",
            createdAt: new Date("2026-03-23T08:00:00.000Z"),
            id: "history-1",
            message: "Post updated",
            metadataJson: "{}",
            method: "POST",
            path: "/dashboard/posts",
            requestId: "req-2",
            resource: "posts",
            result: "success",
            statusCode: 302,
            targetId: "post-1",
            targetLabel: "Edge note",
            userId: "user-admin",
            userRole: "admin",
          },
        ],
        pagination: {
          direction: "next",
          hasNextPage: false,
          hasPreviousPage: true,
          nextCursor: null,
          pageSize: 25,
          previousCursor: "prev-history",
        },
      },
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
        canDeleteErrors: true,
        canDeleteHistory: true,
        canExportErrors: true,
        canExportHistory: true,
        canReadErrors: true,
        canReadHistory: true,
      },
      pagination: {
        errors: {
          direction: "next",
          hasNextPage: true,
          hasPreviousPage: false,
          nextCursor: "next-error",
          pageSize: 25,
          previousCursor: null,
        },
        history: {
          direction: "next",
          hasNextPage: false,
          hasPreviousPage: true,
          nextCursor: null,
          pageSize: 25,
          previousCursor: "prev-history",
        },
      },
      selectedTab: "errors",
      totals: {
        errors: 1,
        history: 1,
      },
    });
    expect(loadDashboardLoggingOverviewMock).toHaveBeenCalledWith(context, {
      errorPage: {
        cursor: null,
        direction: "next",
      },
      historyPage: undefined,
      includeErrorTotals: true,
      includeHistoryTotals: true,
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

  it("falls back to the readable tab when the requested tab is unauthorized", async () => {
    const { loadDashboardLoggingData } =
      await import("~/features/dashboard/logging/server");

    requireSessionMock.mockResolvedValue({
      user: {
        claims: ["logs.error.read"],
        id: "user-operator",
        role: "author",
      },
    });
    loadDashboardLoggingOverviewMock.mockResolvedValue({
      errorPage: {
        entries: [],
        pagination: {
          direction: "next",
          hasNextPage: false,
          hasPreviousPage: false,
          nextCursor: null,
          pageSize: 25,
          previousCursor: null,
        },
      },
      historyPage: {
        entries: [],
        pagination: {
          direction: "next",
          hasNextPage: false,
          hasPreviousPage: false,
          nextCursor: null,
          pageSize: 25,
          previousCursor: null,
        },
      },
      totals: {
        errorCount: 2,
        historyCount: 0,
      },
    });

    const response = await loadDashboardLoggingData(
      context,
      new Request("http://localhost:3000/dashboard/logging?tab=history"),
    );

    if (response instanceof Response) {
      throw new Error("Expected granted logging loader data");
    }

    expect(response.selectedTab).toBe("errors");
    expect(response.permissions).toMatchObject({
      canReadErrors: true,
      canReadHistory: false,
    });
    expect(loadDashboardLoggingOverviewMock).toHaveBeenCalledWith(context, {
      errorPage: {
        cursor: null,
        direction: "next",
      },
      historyPage: undefined,
      includeErrorTotals: true,
      includeHistoryTotals: false,
    });
  });

  it("routes history cursor pagination through the loader", async () => {
    const { buildLoggingCursor } = await import("~/domain/logging/model");
    const { loadDashboardLoggingData } =
      await import("~/features/dashboard/logging/server");
    const cursor = buildLoggingCursor({
      createdAt: new Date("2026-03-29T09:00:00.000Z"),
      id: "history-99",
    });

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-admin",
        role: "admin",
      },
    });
    loadDashboardLoggingOverviewMock.mockResolvedValue({
      errorPage: {
        entries: [],
        pagination: {
          direction: "next",
          hasNextPage: false,
          hasPreviousPage: false,
          nextCursor: null,
          pageSize: 25,
          previousCursor: null,
        },
      },
      historyPage: {
        entries: [],
        pagination: {
          direction: "previous",
          hasNextPage: false,
          hasPreviousPage: true,
          nextCursor: null,
          pageSize: 25,
          previousCursor: "prev-history",
        },
      },
      totals: {
        errorCount: 0,
        historyCount: 0,
      },
    });

    await loadDashboardLoggingData(
      context,
      new Request(
        `http://localhost:3000/dashboard/logging?tab=history&cursor=${encodeURIComponent(cursor)}&direction=previous`,
      ),
    );

    expect(loadDashboardLoggingOverviewMock).toHaveBeenLastCalledWith(context, {
      errorPage: undefined,
      historyPage: {
        cursor: {
          createdAtIso: "2026-03-29T09:00:00.000Z",
          id: "history-99",
        },
        direction: "previous",
      },
      includeErrorTotals: true,
      includeHistoryTotals: true,
    });
  });

  it("exports error logs for an authorized admin session", async () => {
    const { loadDashboardLoggingExportFile } =
      await import("~/features/dashboard/logging/server");

    const request = new Request(
      "http://localhost:3000/dashboard/logging/export?startAt=2026-03-29T19:00&endAt=2026-03-29T20:00&intent=export-errors",
    );

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-admin",
        role: "admin",
      },
    });
    parseLoggingRangeSearchParamsMock.mockReturnValue({
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
        category: "server",
        code: "logging.error",
        createdAt: new Date("2026-03-29T16:30:00.000Z"),
        fingerprint: "fingerprint-1",
        id: "error-1",
        locale: "en",
        message: "Unhandled worker error",
        metadataJson: "{}",
        method: "POST",
        path: "/dashboard/logging",
        requestId: "req-1",
        routeId: "dashboard.logging",
        severity: "error",
        stack: null,
        statusCode: 500,
        userId: "user-admin",
        userRole: "admin",
      },
    ]);

    const response = await loadDashboardLoggingExportFile(context, request);

    if (!(response instanceof Response)) {
      throw new Error("Expected export response");
    }

    const workbookBytes = new Uint8Array(await response.arrayBuffer());

    expect(response.status).toBe(200);
    expect(workbookBytes.slice(0, 2)).toEqual(new Uint8Array([0x50, 0x4b]));
    expect(response.headers.get("Content-Type")).toContain(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    expect(response.headers.get("Content-Disposition")).toContain(".xlsx");
    expect(recordAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "export",
        targetLabel: "error-log-export",
      }),
    );
  });

  it("returns a 403 form error for sessions without export permission", async () => {
    const { loadDashboardLoggingExportFile } =
      await import("~/features/dashboard/logging/server");

    const request = new Request(
      "http://localhost:3000/dashboard/logging/export?startAt=2026-03-29T19:00&endAt=2026-03-29T20:00&intent=export-errors",
    );

    requireSessionMock.mockResolvedValue({
      user: {
        claims: [],
        id: "user-operator",
        role: "author",
      },
    });
    parseLoggingRangeSearchParamsMock.mockReturnValue({
      endAt: new Date("2026-03-29T17:00:00.000Z"),
      intent: "export-errors",
      startAt: new Date("2026-03-29T16:00:00.000Z"),
      values: {
        endAt: "2026-03-29T20:00",
        startAt: "2026-03-29T19:00",
      },
    });

    await expect(
      loadDashboardLoggingExportFile(context, request),
    ).rejects.toMatchObject({
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

  it("requires the matching read claim before exporting error logs", async () => {
    const { loadDashboardLoggingExportFile } =
      await import("~/features/dashboard/logging/server");

    const request = new Request(
      "http://localhost:3000/dashboard/logging/export?startAt=2026-03-29T19:00&endAt=2026-03-29T20:00&intent=export-errors",
    );

    requireSessionMock.mockResolvedValue({
      user: {
        claims: ["logs.error.export"],
        id: "user-exporter",
        role: "author",
      },
    });
    parseLoggingRangeSearchParamsMock.mockReturnValue({
      endAt: new Date("2026-03-29T17:00:00.000Z"),
      intent: "export-errors",
      startAt: new Date("2026-03-29T16:00:00.000Z"),
      values: {
        endAt: "2026-03-29T20:00",
        startAt: "2026-03-29T19:00",
      },
    });
    await expect(
      loadDashboardLoggingExportFile(context, request),
    ).rejects.toMatchObject({
      code: "logging.export.forbidden",
      status: 403,
    });
    expect(listLogErrorHistoryEntriesAscendingMock).not.toHaveBeenCalled();
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

  it("requires the matching read claim before deleting error logs", async () => {
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
        claims: ["logs.error.delete"],
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
    await expect(handleDashboardLoggingAction(context, request)).rejects.toMatchObject({
      code: "logging.delete.forbidden",
      status: 403,
    });
    expect(deleteLogErrorHistoryEntriesByDateRangeMock).not.toHaveBeenCalled();
  });

  it("exports audit logs for an authorized admin session", async () => {
    const { loadDashboardLoggingExportFile } =
      await import("~/features/dashboard/logging/server");

    const request = new Request(
      "http://localhost:3000/dashboard/logging/export?startAt=2026-03-29T19:00&endAt=2026-03-29T20:00&intent=export-history",
    );

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-admin",
        role: "admin",
      },
    });
    parseLoggingRangeSearchParamsMock.mockReturnValue({
      endAt: new Date("2026-03-29T17:00:00.000Z"),
      intent: "export-history",
      startAt: new Date("2026-03-29T16:00:00.000Z"),
      values: {
        endAt: "2026-03-29T20:00",
        startAt: "2026-03-29T19:00",
      },
    });
    listLogHistoryEntriesAscendingMock.mockResolvedValue([
      {
        action: "delete",
        createdAt: new Date("2026-03-29T16:30:00.000Z"),
        id: "history-1",
        message: "Registry deleted",
        metadataJson: "{}",
        method: "POST",
        path: "/dashboard/users",
        requestId: "req-1",
        resource: "users",
        result: "success",
        statusCode: 200,
        targetId: "user-1",
        targetLabel: "Operator",
        userId: "user-admin",
        userRole: "admin",
      },
    ]);

    const response = await loadDashboardLoggingExportFile(context, request);

    if (!(response instanceof Response)) {
      throw new Error("Expected export response");
    }

    const workbookBytes = new Uint8Array(await response.arrayBuffer());

    expect(response.status).toBe(200);
    expect(workbookBytes.slice(0, 2)).toEqual(new Uint8Array([0x50, 0x4b]));
    expect(response.headers.get("Content-Disposition")).toContain("log-history-");
    expect(recordAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "export",
        targetLabel: "audit-log-export",
      }),
    );
  });

  it("rejects oversized error log exports with a form error", async () => {
    const { loadDashboardLoggingExportFile } =
      await import("~/features/dashboard/logging/server");

    const request = new Request(
      "http://localhost:3000/dashboard/logging/export?startAt=2026-03-29T19:00&endAt=2026-03-29T20:00&intent=export-errors",
    );

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-admin",
        role: "admin",
      },
    });
    parseLoggingRangeSearchParamsMock.mockReturnValue({
      endAt: new Date("2026-03-29T17:00:00.000Z"),
      intent: "export-errors",
      startAt: new Date("2026-03-29T16:00:00.000Z"),
      values: {
        endAt: "2026-03-29T20:00",
        startAt: "2026-03-29T19:00",
      },
    });
    listLogErrorHistoryEntriesAscendingMock.mockResolvedValue(
      Array.from({ length: 1001 }, (_, index) => ({
        category: "server",
        code: `logging.error.${index}`,
        createdAt: new Date("2026-03-29T16:30:00.000Z"),
        fingerprint: `fingerprint-${index}`,
        id: `error-${index}`,
        locale: "en",
        message: "Unhandled worker error",
        metadataJson: "{}",
        method: "POST",
        path: "/dashboard/logging",
        requestId: `req-${index}`,
        routeId: "dashboard.logging",
        severity: "error",
        stack: null,
        statusCode: 500,
        userId: "user-admin",
        userRole: "admin",
      })),
    );

    await expect(
      loadDashboardLoggingExportFile(context, request),
    ).rejects.toMatchObject({
      code: "logging.export.limit_exceeded",
      responseData: {
        rangeForm: {
          errors: {
            form: "Secilen aralik en fazla 1000 kayit olarak indirilebilir. Araligi daraltin.",
          },
          values: {
            endAt: "2026-03-29T20:00",
            startAt: "2026-03-29T19:00",
          },
        },
      },
      status: 400,
    });
  });

  it("rejects export intents on the POST action surface", async () => {
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

    await expect(handleDashboardLoggingAction(context, request)).rejects.toMatchObject({
      code: "logging.mutation.invalid_intent",
      details: {
        intent: "export-errors",
      },
      status: 400,
    });
    expect(parseLoggingRangeFormDataMock).not.toHaveBeenCalled();
    expect(parseLoggingRangeSearchParamsMock).not.toHaveBeenCalled();
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

  it("deletes audit logs and returns a success notice", async () => {
    const { handleDashboardLoggingAction } =
      await import("~/features/dashboard/logging/server");

    const request = new Request("http://localhost:3000/dashboard/logging", {
      body: new URLSearchParams({
        endAt: "2026-03-29T20:00",
        intent: "delete-history",
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
      intent: "delete-history",
      startAt: new Date("2026-03-29T16:00:00.000Z"),
      values: {
        endAt: "2026-03-29T20:00",
        startAt: "2026-03-29T19:00",
      },
    });
    deleteLogHistoryEntriesByDateRangeMock.mockResolvedValue(3);

    await expect(handleDashboardLoggingAction(context, request)).resolves.toMatchObject(
      {
        notice: "3 audit logu silindi.",
      },
    );
    expect(recordAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "delete",
        targetLabel: "audit-log-delete",
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
    expect(deleteLogHistoryEntriesByDateRangeMock).not.toHaveBeenCalled();
    expect(deleteLogErrorHistoryEntriesByDateRangeMock).not.toHaveBeenCalled();
    expect(listLogHistoryEntriesAscendingMock).not.toHaveBeenCalled();
    expect(listLogErrorHistoryEntriesAscendingMock).not.toHaveBeenCalled();
  });
});
