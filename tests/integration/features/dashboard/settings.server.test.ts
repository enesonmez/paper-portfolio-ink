import type { AppLoadContext } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireSessionMock } = vi.hoisted(() => ({
  requireSessionMock: vi.fn(),
}));

vi.mock("~/shared/auth/session.server", () => ({
  requireSession: requireSessionMock,
}));

describe("dashboard settings server", () => {
  const context = {
    db: { query: {} } as never,
    runtime: { platform: "node" },
  } as unknown as AppLoadContext;

  beforeEach(() => {
    requireSessionMock.mockReset();
  });

  it("loads the selected tab for admin sessions", async () => {
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

    expect(response).toEqual({
      access: "granted",
      selectedTab: "runtime",
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
});
