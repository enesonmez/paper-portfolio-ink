import { beforeEach, describe, expect, it, vi } from "vitest";

const { getSessionFromRequestMock, resolveAuthConfigMock } = vi.hoisted(() => {
  return {
    getSessionFromRequestMock: vi.fn(),
    resolveAuthConfigMock: vi.fn(),
  };
});

vi.mock("../../app/lib/auth/auth-config.server", () => {
  return {
    resolveAuthConfig: resolveAuthConfigMock,
  };
});

vi.mock("../../app/lib/auth/auth.server", () => {
  return {
    getSessionFromRequest: getSessionFromRequestMock,
  };
});

describe("requireSession", () => {
  beforeEach(() => {
    getSessionFromRequestMock.mockReset();
    resolveAuthConfigMock.mockReset();
  });

  it("returns the current session when the request is authenticated", async () => {
    const request = new Request("http://localhost:3000/dashboard");
    const session = {
      session: {
        id: "session-1",
        userId: "user-1",
      },
      user: {
        id: "user-1",
        email: "admin@example.com",
      },
    };
    const { requireSession } = await import("../../app/lib/auth/session.server");

    resolveAuthConfigMock.mockReturnValue({
      secret: "test-secret",
      baseURL: "http://localhost:3000",
      trustedOrigins: ["http://localhost:3000"],
    });
    getSessionFromRequestMock.mockResolvedValue(session);

    await expect(
      requireSession(request, {
        db: { query: {} },
        runtime: { platform: "node" },
      } as never),
    ).resolves.toBe(session);
  });

  it("returns a redirect response for unauthenticated requests", async () => {
    const request = new Request("http://localhost:3000/dashboard");
    const { requireSession } = await import("../../app/lib/auth/session.server");

    resolveAuthConfigMock.mockReturnValue({
      secret: "test-secret",
      baseURL: "http://localhost:3000",
      trustedOrigins: ["http://localhost:3000"],
    });
    getSessionFromRequestMock.mockResolvedValue(null);

    await expect(
      requireSession(
        request,
        {
          db: { query: {} },
          runtime: { platform: "node" },
        } as never,
        {
          redirectTo: "/",
        },
      ),
    ).resolves.toMatchObject({
      status: 302,
    });
  });
});
