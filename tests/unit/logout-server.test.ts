import { beforeEach, describe, expect, it, vi } from "vitest";

const { createAuthMock, signOutMock } = vi.hoisted(() => {
  return {
    createAuthMock: vi.fn(),
    signOutMock: vi.fn(),
  };
});

vi.mock("../../app/lib/auth/auth.server", () => {
  return {
    createAuth: createAuthMock,
  };
});

vi.mock("../../app/lib/auth/auth-config.server", () => {
  return {
    resolveAuthConfig: vi.fn((request: Request) => ({
      secret: "test-secret",
      baseURL: new URL(request.url).origin,
      trustedOrigins: [new URL(request.url).origin],
    })),
  };
});

describe("logout server helper", () => {
  beforeEach(() => {
    createAuthMock.mockReset();
    signOutMock.mockReset();
  });

  it("signs out through Better Auth and forwards cookie headers to a login redirect", async () => {
    const request = new Request("http://localhost:3000/logout", {
      method: "POST",
      headers: {
        cookie: "better-auth.session_token=abc",
      },
    });
    const authResponse = new Response(null, {
      status: 200,
      headers: {
        "set-cookie": "better-auth.session_token=; Path=/; HttpOnly",
      },
    });
    const { performLogout } = await import(
      "../../app/features/auth/logout/logout.server"
    );

    createAuthMock.mockReturnValue({
      api: {
        signOut: signOutMock,
      },
    });
    signOutMock.mockResolvedValue(authResponse);

    const response = await performLogout({
      request,
      context: {
        db: { query: {} },
        runtime: { platform: "node" },
      } as never,
    });

    expect(signOutMock).toHaveBeenCalledWith({
      asResponse: true,
      headers: request.headers,
    });
    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/login");
    expect(response.headers.get("set-cookie")).toContain(
      "better-auth.session_token=",
    );
  });

  it("redirects GET requests for the logout route back to login", async () => {
    const request = new Request("http://localhost:3000/logout");
    const { redirectLoggedOutUsers } = await import(
      "../../app/features/auth/logout/logout.server"
    );

    const response = redirectLoggedOutUsers(request);

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/login");
  });
});
