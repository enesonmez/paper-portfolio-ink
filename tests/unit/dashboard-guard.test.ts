import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireSessionMock } = vi.hoisted(() => {
  return {
    requireSessionMock: vi.fn(),
  };
});

vi.mock("../../app/shared/auth/session.server", () => {
  return {
    requireSession: requireSessionMock,
  };
});

describe("dashboard route guard", () => {
  beforeEach(() => {
    requireSessionMock.mockReset();
  });

  it("enforces a server-side session check in the dashboard parent loader", async () => {
    const request = new Request("http://localhost:3000/dashboard");
    const { loader } = await import("../../app/routes/dashboard");

    requireSessionMock.mockResolvedValue({
      session: {
        id: "session-1",
      },
      user: {
        id: "user-1",
        name: "Enes Admin",
        email: "admin@paper-portfolio-ink.local",
        role: "admin",
      },
    });

    await expect(
      loader({
        request,
        context: {
          db: { query: {} },
          runtime: { platform: "node" },
        },
        params: {},
      } as never),
    ).resolves.toEqual({
      user: {
        displayName: "Enes Admin",
        email: "admin@paper-portfolio-ink.local",
        id: "user-1",
        initials: "EA",
        role: "admin",
      },
    });

    expect(requireSessionMock).toHaveBeenCalledWith(
      request,
      expect.objectContaining({
        db: { query: {} },
      }),
      {
        redirectTo: "/tr/login?redirectTo=%2Fdashboard",
      },
    );
  }, 20000);
});
