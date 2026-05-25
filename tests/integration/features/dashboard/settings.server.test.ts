import type { AppLoadContext } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  loadAccountConfigurationParametersMock,
  purgeAccountConfigurationCacheMock,
  recordAuditLogMock,
  requireSessionMock,
  updateAccountConfigurationParameterMock,
} = vi.hoisted(() => ({
  loadAccountConfigurationParametersMock: vi.fn(),
  purgeAccountConfigurationCacheMock: vi.fn(),
  recordAuditLogMock: vi.fn(),
  requireSessionMock: vi.fn(),
  updateAccountConfigurationParameterMock: vi.fn(),
}));

vi.mock("~/lib/configuration/configuration.server", () => ({
  loadAccountConfigurationParameters: loadAccountConfigurationParametersMock,
  purgeAccountConfigurationCache: purgeAccountConfigurationCacheMock,
  updateAccountConfigurationParameter: updateAccountConfigurationParameterMock,
  warmAccountConfigurationCache: vi.fn(),
}));

vi.mock("~/shared/auth/session.server", () => ({
  requireSession: requireSessionMock,
}));

vi.mock("~/shared/logging/audit.server", () => ({
  recordAuditLog: recordAuditLogMock,
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

    loadAccountConfigurationParametersMock.mockResolvedValue({
      "contact.email": "admin@paper-portfolio-ink.dev",
      "site.domainUrl": "https://paper-portfolio-ink.dev",
      "site.name": "Paper Ink",
      "social.github": "https://github.com/enesonmez",
      "social.instagram": "https://instagram.com/paperportfolioink",
      "social.linkedin": "https://linkedin.com/in/enes-ink",
      "social.x": "https://x.com/paperinkdev",
    });
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
    expect(loadAccountConfigurationParametersMock).toHaveBeenCalledWith(
      context,
      expect.any(Request),
    );
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

  it("rejects non-admin sessions from the settings surface", async () => {
    const { loadDashboardSettingsData } =
      await import("~/features/dashboard/settings/server");

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-author",
        role: "author",
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
});
