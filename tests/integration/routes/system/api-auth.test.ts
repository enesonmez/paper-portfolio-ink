import { beforeEach, describe, expect, it, vi } from "vitest";

const { createAuthMock, handlerMock } = vi.hoisted(() => {
  return {
    createAuthMock: vi.fn(),
    handlerMock: vi.fn(),
  };
});

vi.mock("~/shared/auth/auth-config.server", () => {
  return {
    resolveAuthConfig: vi.fn((request: Request) => ({
      secret: "test-secret",
      baseURL: new URL(request.url).origin,
      trustedOrigins: [new URL(request.url).origin],
    })),
  };
});

vi.mock("~/shared/auth/auth.server", () => {
  return {
    createAuth: createAuthMock,
  };
});

describe("auth route", () => {
  beforeEach(() => {
    createAuthMock.mockReset();
    handlerMock.mockReset();
  });

  it("delegates GET requests to Better Auth handler", async () => {
    const request = new Request("http://localhost:3000/api/auth/session");
    const response = new Response("ok");
    const { loader } = await import("~/routes/system/api-auth");

    handlerMock.mockResolvedValue(response);
    createAuthMock.mockReturnValue({ handler: handlerMock });

    await expect(
      loader({
        request,
        context: {
          db: { query: {} },
          runtime: { platform: "node" },
        },
        params: { "*": "session" },
      } as never),
    ).resolves.toBe(response);
  });

  it("delegates POST requests to Better Auth handler", async () => {
    const request = new Request("http://localhost:3000/api/auth/sign-in/email", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com", password: "pass1234" }),
      headers: {
        "content-type": "application/json",
      },
    });
    const response = new Response("created", { status: 200 });
    const { action } = await import("~/routes/system/api-auth");

    handlerMock.mockResolvedValue(response);
    createAuthMock.mockReturnValue({ handler: handlerMock });

    await expect(
      action({
        request,
        context: {
          db: { query: {} },
          runtime: { platform: "node" },
        },
        params: { "*": "sign-in/email" },
      } as never),
    ).resolves.toBe(response);
  });
});
