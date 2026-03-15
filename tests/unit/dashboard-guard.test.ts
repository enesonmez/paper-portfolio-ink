import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireSessionMock } = vi.hoisted(() => {
  return {
    requireSessionMock: vi.fn(),
  };
});

vi.mock("../../app/lib/auth/session.server", () => {
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
    ).resolves.toBeNull();

    expect(requireSessionMock).toHaveBeenCalledWith(
      request,
      expect.objectContaining({
        db: { query: {} },
      }),
      {
        redirectTo: "/",
      },
    );
  });
});
