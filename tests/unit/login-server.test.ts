import { isRouteErrorResponse } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { createAuthMock, findUserByEmailMock, signInEmailMock } = vi.hoisted(() => {
  return {
    createAuthMock: vi.fn(),
    findUserByEmailMock: vi.fn(),
    signInEmailMock: vi.fn(),
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

vi.mock("../../app/lib/users/users.server", () => {
  return {
    findUserByEmail: findUserByEmailMock,
  };
});

describe("login server helpers", () => {
  beforeEach(() => {
    createAuthMock.mockReset();
    findUserByEmailMock.mockReset();
    signInEmailMock.mockReset();
  });

  it("builds a dashboard login redirect url from a protected request", async () => {
    const request = new Request("http://localhost:3000/dashboard?tab=posts");
    const { buildLoginRedirect } = await import("../../app/lib/auth/login.server");

    expect(buildLoginRedirect(request)).toBe(
      "/login?redirectTo=%2Fdashboard%3Ftab%3Dposts",
    );
  });

  it("normalizes unsafe redirect targets back to the dashboard root", async () => {
    const { normalizeRedirectTarget } = await import("../../app/lib/auth/login.server");

    expect(normalizeRedirectTarget("https://evil.example")).toBe("/dashboard");
    expect(normalizeRedirectTarget("//evil.example")).toBe("/dashboard");
    expect(normalizeRedirectTarget("/dashboard/projects")).toBe("/dashboard/projects");
  });

  it("returns field errors for invalid login submissions", async () => {
    const formData = new FormData();
    formData.set("email", "not-an-email");
    formData.set("password", "short");
    formData.set("redirectTo", "https://evil.example");
    const { parseLoginFormData } = await import("../../app/lib/auth/login.server");

    expect(parseLoginFormData(formData)).toEqual({
      errors: {
        email: "Gecerli bir e-posta gir.",
        password: "Parola en az 8 karakter olmali.",
      },
      values: {
        email: "not-an-email",
        redirectTo: "/dashboard",
      },
    });
  });

  it("signs in with Better Auth and forwards cookie headers into a redirect response", async () => {
    const request = new Request("http://localhost:3000/login", {
      method: "POST",
      headers: {
        cookie: "test-cookie=value",
      },
    });
    const authResponse = new Response(
      JSON.stringify({
        redirect: true,
        url: "/dashboard",
      }),
      {
        status: 200,
        headers: {
          "content-type": "application/json",
          "set-cookie": "better-auth.session_token=abc; Path=/; HttpOnly",
        },
      },
    );
    const { signInWithEmail } = await import("../../app/lib/auth/login.server");

    createAuthMock.mockReturnValue({
      api: {
        signInEmail: signInEmailMock,
      },
    });
    findUserByEmailMock.mockResolvedValue({
      email: "admin@example.com",
      id: "user-1",
      isActive: true,
      role: "admin",
    });
    signInEmailMock.mockResolvedValue(authResponse);

    const response = await signInWithEmail({
      request,
      context: {
        db: { query: {} },
        runtime: { platform: "node" },
      } as never,
      submission: {
        email: "admin@example.com",
        password: "password1234",
        redirectTo: "/dashboard",
      },
    });

    expect(signInEmailMock).toHaveBeenCalledWith({
      asResponse: true,
      body: {
        callbackURL: "/dashboard",
        email: "admin@example.com",
        password: "password1234",
        rememberMe: true,
      },
      headers: request.headers,
    });
    expect(response).toBeInstanceOf(Response);
    expect((response as Response).status).toBe(302);
    expect((response as Response).headers.get("location")).toBe("/dashboard");
    expect((response as Response).headers.get("set-cookie")).toContain(
      "better-auth.session_token=abc",
    );
  });

  it("returns a user-facing form error when Better Auth answers with invalid credentials", async () => {
    const request = new Request("http://localhost:3000/login", {
      method: "POST",
    });
    const authResponse = new Response(
      JSON.stringify({
        code: "USER_NOT_FOUND",
        message: "User not found",
      }),
      {
        status: 401,
        headers: {
          "content-type": "application/json",
        },
      },
    );
    const { signInWithEmail } = await import("../../app/lib/auth/login.server");

    createAuthMock.mockReturnValue({
      api: {
        signInEmail: signInEmailMock,
      },
    });
    findUserByEmailMock.mockResolvedValue(null);
    signInEmailMock.mockResolvedValue(authResponse);

    const result = await signInWithEmail({
      request,
      context: {
        db: { query: {} },
        runtime: { platform: "node" },
      } as never,
      submission: {
        email: "enesonmezx@gmail.com",
        password: "password1234",
        redirectTo: "/dashboard",
      },
    });

    expect(isRouteErrorResponse(result)).toBe(false);
    expect(result).toMatchObject({
      init: {
        status: 401,
      },
      data: {
        errors: {
          form: "E-posta veya parola hatali.",
        },
        values: {
          email: "enesonmezx@gmail.com",
          redirectTo: "/dashboard",
        },
      },
    });
  });

  it("blocks inactive users before Better Auth creates a session", async () => {
    const request = new Request("http://localhost:3000/login", {
      method: "POST",
    });
    const { signInWithEmail } = await import("../../app/lib/auth/login.server");

    findUserByEmailMock.mockResolvedValue({
      email: "disabled@example.com",
      id: "user-2",
      isActive: false,
      role: "author",
    });

    const result = await signInWithEmail({
      request,
      context: {
        db: { query: {} },
        runtime: { platform: "node" },
      } as never,
      submission: {
        email: "disabled@example.com",
        password: "password1234",
        redirectTo: "/dashboard",
      },
    });

    expect(createAuthMock).not.toHaveBeenCalled();
    expect(signInEmailMock).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      init: {
        status: 403,
      },
      data: {
        errors: {
          form: "E-posta veya parola hatali.",
        },
      },
    });
  });
});
