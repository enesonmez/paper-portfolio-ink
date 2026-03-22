import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireDashboardActorMock } = vi.hoisted(() => {
  return {
    requireDashboardActorMock: vi.fn(),
  };
});

vi.mock("~/shared/authz/authz.server", () => {
  return {
    requireDashboardActor: requireDashboardActorMock,
  };
});

describe("dashboard route guard", () => {
  beforeEach(() => {
    requireDashboardActorMock.mockReset();
  });

  it("enforces a server-side session check in the dashboard parent loader", async () => {
    const request = new Request("http://localhost:3000/dashboard");
    const { loader } = await import("~/routes/dashboard/layout");

    requireDashboardActorMock.mockResolvedValue({
      actor: {
        claims: ["dashboard.access", "users.read"],
      },
      sessionUser: {
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
        claims: ["dashboard.access", "users.read"],
        id: "user-1",
        initials: "EA",
        role: "admin",
      },
    });

    expect(requireDashboardActorMock).toHaveBeenCalledWith(
      expect.objectContaining({
        db: { query: {} },
      }),
      request,
    );
  }, 20000);
});
