import type { AppLoadContext } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  loadAccountConfigurationParametersMock,
  purgeAccountConfigurationCacheMock,
  recordAuditLogMock,
  requireSessionMock,
  updateAccountConfigurationParameterMock,
  deleteOtherSessionsMock,
  deleteAllOtherSessionsMock,
  getSessionForRequestMock,
  listRuntimeCacheEntriesMock,
  refreshRuntimeCacheEntryMock,
} = vi.hoisted(() => ({
  loadAccountConfigurationParametersMock: vi.fn(),
  purgeAccountConfigurationCacheMock: vi.fn(),
  recordAuditLogMock: vi.fn(),
  requireSessionMock: vi.fn(),
  updateAccountConfigurationParameterMock: vi.fn(),
  deleteOtherSessionsMock: vi.fn(),
  deleteAllOtherSessionsMock: vi.fn(),
  getSessionForRequestMock: vi.fn(),
  listRuntimeCacheEntriesMock: vi.fn(),
  refreshRuntimeCacheEntryMock: vi.fn(),
}));

vi.mock("~/lib/configuration/configuration.server", () => ({
  loadAccountConfigurationParameters: loadAccountConfigurationParametersMock,
  purgeAccountConfigurationCache: purgeAccountConfigurationCacheMock,
  updateAccountConfigurationParameter: updateAccountConfigurationParameterMock,
  warmAccountConfigurationCache: vi.fn(),
}));

vi.mock("~/shared/auth/session.server", () => ({
  requireSession: requireSessionMock,
  getSessionForRequest: getSessionForRequestMock,
}));

vi.mock("~/lib/configuration/sessions.server", () => ({
  deleteOtherSessions: deleteOtherSessionsMock,
  deleteAllOtherSessions: deleteAllOtherSessionsMock,
}));

vi.mock("~/shared/logging/audit.server", () => ({
  recordAuditLog: recordAuditLogMock,
}));

vi.mock("~/features/dashboard/settings/operations/runtime-cache.server", () => ({
  listRuntimeCacheEntries: listRuntimeCacheEntriesMock,
  refreshRuntimeCacheEntry: refreshRuntimeCacheEntryMock,
}));

describe("dashboard settings server", () => {
  const context = {
    db: { query: {} } as never,
    runtime: { platform: "node" },
  } as unknown as AppLoadContext;

  beforeEach(() => {
    loadAccountConfigurationParametersMock.mockReset();
    purgeAccountConfigurationCacheMock.mockReset();
    recordAuditLogMock.mockReset();
    requireSessionMock.mockReset();
    updateAccountConfigurationParameterMock.mockReset();
    deleteOtherSessionsMock.mockReset();
    deleteAllOtherSessionsMock.mockReset();
    getSessionForRequestMock.mockReset();
    listRuntimeCacheEntriesMock.mockReset();
    refreshRuntimeCacheEntryMock.mockReset();

    loadAccountConfigurationParametersMock.mockResolvedValue({
      "contact.email": "admin@paper-portfolio-ink.dev",
      "site.domainUrl": "https://paper-portfolio-ink.dev",
      "site.name": "Paper Ink",
      "social.github": "https://github.com/enesonmez",
      "social.instagram": "https://instagram.com/paperportfolioink",
      "social.linkedin": "https://linkedin.com/in/enes-ink",
      "social.x": "https://x.com/paperinkdev",
      "appearance.primaryColor": "yellow",
      "appearance.headingFont": "vt323",
      "appearance.bodyFont": "mono",
    });
    listRuntimeCacheEntriesMock.mockResolvedValue([
      {
        cacheKey: "http://localhost:3000/__cache/configuration/parameters",
        id: "configuration",
        scope: "global",
        strategy: "memory",
        value: 10,
        valueKind: "keys",
        warmScope: "global",
      },
    ]);
  });

  it("loads the selected tab and account registry for admin sessions", async () => {
    const { loadDashboardSettingsData } =
      await import("~/features/dashboard/settings/server");

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-admin",
        role: "admin",
      },
    });

    const response = await loadDashboardSettingsData(
      context,
      new Request("http://localhost:3000/dashboard/settings?tab=runtime"),
    );

    if (response instanceof Response) {
      throw new Error("Expected settings loader data");
    }

    expect(response).toMatchObject({
      access: "granted",
      accountForm: {
        editingKey: null,
        isOpen: false,
        mode: null,
      },
      selectedTab: "runtime",
    });
    if (response.access !== "granted") {
      throw new Error("Expected granted settings loader data");
    }
    expect(response.accountValues["site.name"]).toBe("Paper Ink");
    expect(loadAccountConfigurationParametersMock).not.toHaveBeenCalled();
    expect(listRuntimeCacheEntriesMock).toHaveBeenCalledTimes(1);
    const runtimeListArgs = listRuntimeCacheEntriesMock.mock.calls[0]?.[0] as
      | {
          actor: {
            role: string | null;
            userId: string | null;
          };
          context: AppLoadContext;
          request: Request;
        }
      | undefined;
    expect(runtimeListArgs?.actor.role).toBe("admin");
    expect(runtimeListArgs?.actor.userId).toBe("user-admin");
    expect(runtimeListArgs?.context).toBe(context);
    expect(runtimeListArgs?.request).toBeInstanceOf(Request);
    expect(response.runtime).toEqual({
      cacheEntries: [
        {
          cacheKey: "http://localhost:3000/__cache/configuration/parameters",
          id: "configuration",
          scope: "global",
          strategy: "memory",
          value: 10,
          valueKind: "keys",
          warmScope: "global",
        },
      ],
      platform: "node",
    });
  });

  it("opens the account modal when a setting query parameter is present", async () => {
    const { loadDashboardSettingsData } =
      await import("~/features/dashboard/settings/server");

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-admin",
        role: "admin",
      },
    });

    const response = await loadDashboardSettingsData(
      context,
      new Request(
        "http://localhost:3000/dashboard/settings?tab=account&modal=edit-account-setting&setting=site.name",
      ),
    );

    if (response instanceof Response || response.access !== "granted") {
      throw new Error("Expected granted settings loader data");
    }

    expect(response.accountForm).toEqual({
      editingKey: "site.name",
      isOpen: true,
      mode: "edit",
      values: {
        key: "site.name",
        value: "Paper Ink",
      },
    });
  });

  it("rejects sessions without any settings claim from the settings surface", async () => {
    const { loadDashboardSettingsData } =
      await import("~/features/dashboard/settings/server");

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-author",
        role: "author",
        claims: ["dashboard.access", "posts.read.own"],
      },
    });

    await expect(
      loadDashboardSettingsData(
        context,
        new Request("http://localhost:3000/dashboard/settings"),
      ),
    ).rejects.toMatchObject({
      code: "settings.read.forbidden",
      responseData: {
        access: "denied",
      },
      status: 403,
    });
  });

  it("updates an account configuration value and redirects back to the account tab", async () => {
    const { handleDashboardSettingsAction } =
      await import("~/features/dashboard/settings/server");

    const request = new Request(
      "http://localhost:3000/tr/dashboard/settings?tab=account&modal=edit-account-setting&setting=site.name",
      {
        body: new URLSearchParams({
          intent: "update-account-configuration",
          key: "site.name",
          value: "Paper Portfolio Ink",
        }),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
      },
    );

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-admin",
        role: "admin",
      },
    });

    const response = await handleDashboardSettingsAction(context, request);

    expect(response).toBeInstanceOf(Response);
    expect(response.headers.get("Location")).toContain(
      "/tr/dashboard/settings?tab=account",
    );
    expect(updateAccountConfigurationParameterMock).toHaveBeenCalledWith(context.db, {
      key: "site.name",
      value: "Paper Portfolio Ink",
    });
    expect(purgeAccountConfigurationCacheMock).toHaveBeenCalledWith(context, request);
    expect(recordAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "update",
        resource: "settings",
        targetId: "site.name",
      }),
    );
  });

  it("returns field errors for invalid account configuration submissions", async () => {
    const { handleDashboardSettingsAction } =
      await import("~/features/dashboard/settings/server");

    const request = new Request(
      "http://localhost:3000/dashboard/settings?tab=account&modal=edit-account-setting&setting=contact.email",
      {
        body: new URLSearchParams({
          intent: "update-account-configuration",
          key: "contact.email",
          value: "not-an-email",
        }),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
      },
    );

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-admin",
        role: "admin",
      },
    });

    await expect(handleDashboardSettingsAction(context, request)).rejects.toMatchObject(
      {
        code: "settings.validation",
        responseData: {
          errors: {
            value: "Gecerli bir e-posta adresi gir.",
          },
          values: {
            key: "contact.email",
            value: "not-an-email",
          },
        },
        status: 400,
      },
    );
    expect(updateAccountConfigurationParameterMock).not.toHaveBeenCalled();
  });

  it("refreshes a runtime cache entry and redirects back to the runtime tab", async () => {
    const { handleDashboardSettingsAction } =
      await import("~/features/dashboard/settings/server");

    const request = new Request(
      "http://localhost:3000/tr/dashboard/settings?tab=runtime",
      {
        body: new URLSearchParams({
          intent: "refresh-runtime-cache",
          cacheId: "configuration",
        }),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
      },
    );

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-admin",
        role: "admin",
      },
    });

    const response = await handleDashboardSettingsAction(context, request);

    expect(response).toBeInstanceOf(Response);
    expect(response.headers.get("Location")).toContain(
      "/tr/dashboard/settings?tab=runtime",
    );
    expect(refreshRuntimeCacheEntryMock).toHaveBeenCalledTimes(1);
    const runtimeRefreshArgs = refreshRuntimeCacheEntryMock.mock.calls[0]?.[0] as
      | {
          actor: {
            role: string | null;
            userId: string | null;
          };
          cacheId: string;
          context: AppLoadContext;
          request: Request;
        }
      | undefined;
    expect(runtimeRefreshArgs?.actor.role).toBe("admin");
    expect(runtimeRefreshArgs?.actor.userId).toBe("user-admin");
    expect(runtimeRefreshArgs?.cacheId).toBe("configuration");
    expect(runtimeRefreshArgs?.context).toBe(context);
    expect(runtimeRefreshArgs?.request).toBe(request);
    expect(recordAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "update",
        resource: "settings",
        targetId: "configuration",
      }),
    );
  });

  it("revokes all other sessions for the current user", async () => {
    const { handleDashboardSettingsAction } =
      await import("~/features/dashboard/settings/server");

    const request = new Request(
      "http://localhost:3000/tr/dashboard/settings?tab=security",
      {
        body: new URLSearchParams({
          intent: "revoke-other-sessions",
        }),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
      },
    );

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-author",
        role: "author",
        claims: ["dashboard.access", "settings.security.manage.own"],
      },
    });

    getSessionForRequestMock.mockResolvedValue({
      session: {
        token: "current-token-123",
      },
    });

    const response = await handleDashboardSettingsAction(context, request);

    expect(response).toBeInstanceOf(Response);
    expect(response.headers.get("Location")).toContain(
      "/tr/dashboard/settings?tab=security",
    );
    expect(deleteOtherSessionsMock).toHaveBeenCalledWith(
      context.db,
      "user-author",
      "current-token-123",
    );
    expect(recordAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "delete",
        resource: "settings",
        targetId: "user-author",
      }),
    );
  });

  it("allows admin to revoke all active sessions across all users", async () => {
    const { handleDashboardSettingsAction } =
      await import("~/features/dashboard/settings/server");

    const request = new Request(
      "http://localhost:3000/tr/dashboard/settings?tab=security",
      {
        body: new URLSearchParams({
          intent: "revoke-all-sessions",
        }),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
      },
    );

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-admin",
        role: "admin",
        claims: [
          "dashboard.access",
          "settings.security.manage.own",
          "settings.security.manage.any",
        ],
      },
    });

    getSessionForRequestMock.mockResolvedValue({
      session: {
        token: "current-token-123",
      },
    });

    const response = await handleDashboardSettingsAction(context, request);

    expect(response).toBeInstanceOf(Response);
    expect(response.headers.get("Location")).toContain(
      "/tr/dashboard/settings?tab=security",
    );
    expect(deleteAllOtherSessionsMock).toHaveBeenCalledWith(
      context.db,
      "current-token-123",
    );
    expect(recordAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "delete",
        resource: "settings",
        targetId: "user-admin",
      }),
    );
  });

  it("blocks non-admin users from revoking all active sessions", async () => {
    const { handleDashboardSettingsAction } =
      await import("~/features/dashboard/settings/server");

    const request = new Request(
      "http://localhost:3000/tr/dashboard/settings?tab=security",
      {
        body: new URLSearchParams({
          intent: "revoke-all-sessions",
        }),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
      },
    );

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-author",
        role: "author",
        claims: ["dashboard.access", "settings.security.manage.own"],
      },
    });

    getSessionForRequestMock.mockResolvedValue({
      session: {
        token: "current-token-123",
      },
    });

    await expect(handleDashboardSettingsAction(context, request)).rejects.toMatchObject(
      {
        code: "settings.delete.forbidden",
        status: 403,
      },
    );

    expect(deleteAllOtherSessionsMock).not.toHaveBeenCalled();
    expect(recordAuditLogMock).not.toHaveBeenCalled();
  });
});
