import { describe, expect, it } from "vitest";

import {
  DASHBOARD_LOGGING_TAB,
  buildDashboardLoggingHref,
  buildDeniedLoaderData,
  buildGrantedLoggingLoaderData,
  mergeDashboardLoggingRangeFormState,
  normalizeLoggingTab,
  resolveAccessibleLoggingTab,
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
      pagination: {
        errors: {
          direction: "next",
          hasNextPage: false,
          hasPreviousPage: false,
          nextCursor: null,
          pageSize: 0,
          previousCursor: null,
        },
        history: {
          direction: "next",
          hasNextPage: false,
          hasPreviousPage: false,
          nextCursor: null,
          pageSize: 0,
          previousCursor: null,
        },
      },
      permissions: {
        canDeleteErrors: false,
        canDeleteHistory: false,
        canExportErrors: false,
        canExportHistory: false,
        canReadErrors: false,
        canReadHistory: false,
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
      errorPage: {
        entries: [
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
        pagination: {
          direction: "next",
          hasNextPage: false,
          hasPreviousPage: true,
          nextCursor: null,
          pageSize: 25,
          previousCursor: "prev-history",
        },
      },
      permissions: {
        canDeleteErrors: true,
        canDeleteHistory: true,
        canExportErrors: true,
        canExportHistory: true,
        canReadErrors: true,
        canReadHistory: true,
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
    expect(
      buildDashboardLoggingHref({
        cursor: "next-error",
        direction: "next",
        tab: DASHBOARD_LOGGING_TAB.errors,
      }),
    ).toBe("/dashboard/logging?tab=errors&cursor=next-error&direction=next");
    expect(
      resolveAccessibleLoggingTab({
        canReadErrors: true,
        canReadHistory: false,
        requestedTab: DASHBOARD_LOGGING_TAB.history,
      }),
    ).toBe(DASHBOARD_LOGGING_TAB.errors);
  });
});
