import { describe, expect, it } from "vitest";

import {
  DASHBOARD_LOGGING_TAB,
  buildDeniedLoaderData,
  buildGrantedLoggingLoaderData,
  mergeDashboardLoggingRangeFormState,
  normalizeLoggingTab,
} from "~/features/dashboard/logging/state";

describe("dashboard logging state helpers", () => {
  it("normalizes tabs and returns a stable denied payload", () => {
    expect(normalizeLoggingTab("errors")).toBe(DASHBOARD_LOGGING_TAB.errors);
    expect(normalizeLoggingTab("unexpected")).toBe(DASHBOARD_LOGGING_TAB.history);
    expect(buildDeniedLoaderData()).toEqual({
      access: "denied",
      entries: {
        errors: [],
        history: [],
      },
      permissions: {
        canDelete: false,
        canExport: false,
      },
      rangeForm: {
        values: {
          endAt: "",
          startAt: "",
        },
      },
      selectedTab: "history",
      totals: {
        errors: 0,
        history: 0,
      },
    });
  });

  it("builds granted payloads and prefers action range state when available", () => {
    const loaderData = buildGrantedLoggingLoaderData({
      errorEntries: [
        {
          category: "server",
          code: "logging.test",
          createdAt: new Date("2026-03-23T09:00:00.000Z"),
          fingerprint: "fingerprint-1",
          id: "error-1",
          locale: "en",
          message: "Structured error",
          metadataJson: "{}",
          method: "POST",
          path: "/dashboard/logging",
          requestId: "req-1",
          routeId: "dashboard.logging",
          severity: "error",
          stack: null,
          statusCode: 500,
          userId: "user-1",
          userRole: "admin",
        },
      ],
      historyEntries: [
        {
          action: "update",
          createdAt: new Date("2026-03-23T08:00:00.000Z"),
          id: "history-1",
          message: "Project updated",
          metadataJson: "{}",
          method: "POST",
          path: "/dashboard/projects",
          requestId: "req-2",
          resource: "projects",
          result: "success",
          statusCode: 302,
          targetId: "project-1",
          targetLabel: "Edge project",
          userId: "user-1",
          userRole: "admin",
        },
      ],
      permissions: {
        canDelete: true,
        canExport: true,
      },
      selectedTab: DASHBOARD_LOGGING_TAB.errors,
      totals: {
        errors: 1,
        history: 1,
      },
    });

    expect(loaderData).toMatchObject({
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
    expect(
      mergeDashboardLoggingRangeFormState(loaderData.rangeForm, {
        rangeForm: {
          errors: {
            form: "Range invalid",
          },
          values: {
            endAt: "2026-03-23T11:00",
            startAt: "2026-03-23T10:00",
          },
        },
      }),
    ).toEqual({
      errors: {
        form: "Range invalid",
      },
      values: {
        endAt: "2026-03-23T11:00",
        startAt: "2026-03-23T10:00",
      },
    });
  });
});
