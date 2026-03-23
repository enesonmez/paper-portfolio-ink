import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTranslator, getSeedMessages } from "~/shared/i18n/i18n.shared";

const { createAuthMock, findUserByEmailMock, signInEmailMock } = vi.hoisted(() => {
  return {
    createAuthMock: vi.fn(),
    findUserByEmailMock: vi.fn(),
    signInEmailMock: vi.fn(),
  };
});

vi.mock("~/shared/auth/auth.server", () => {
  return {
    createAuth: createAuthMock,
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

vi.mock("~/lib/users/users.server", () => {
  return {
    findUserByEmail: findUserByEmailMock,
  };
});

const t = createTranslator(getSeedMessages("tr"));

describe("login server helpers", () => {
  beforeEach(() => {
    createAuthMock.mockReset();
    findUserByEmailMock.mockReset();
    signInEmailMock.mockReset();
  }, 20000);

  it("builds a dashboard login redirect url from a protected request", async () => {
    const request = new Request("http://localhost:3000/dashboard?tab=posts");
    const { buildLoginRedirect } = await import("~/shared/auth/login.server");

    await expect(
      buildLoginRedirect(
        {
          db: { query: {} },
          runtime: { platform: "node" },
        } as never,
        request,
      ),
    ).resolves.toBe("/tr/login?redirectTo=%2Fdashboard%3Ftab%3Dposts");
  }, 20000);

  it("normalizes unsafe redirect targets back to the dashboard root", async () => {
    const { normalizeRedirectTarget } = await import("~/shared/auth/login.server");

    expect(normalizeRedirectTarget("https://evil.example", "tr")).toBe("/tr/dashboard");
    expect(normalizeRedirectTarget("//evil.example", "tr")).toBe("/tr/dashboard");
    expect(normalizeRedirectTarget("/dashboard/projects", "tr")).toBe(
      "/tr/dashboard/projects",
    );
  }, 20000);

  it("throws field errors for invalid login submissions", async () => {
    const formData = new FormData();
    formData.set("email", "not-an-email");
    formData.set("password", "short");
    formData.set("redirectTo", "https://evil.example");
    const { parseLoginFormData } = await import("~/shared/auth/login.server");

    try {
      parseLoginFormData(formData, "tr", t);
      throw new Error("Expected parseLoginFormData to throw");
    } catch (error) {
      expect(error).toMatchObject({
        code: "auth.login.validation",
        responseData: {
          errors: {
            email: "Gecerli bir e-posta gir.",
            password: "Parola en az 8 karakter olmali.",
          },
          values: {
            email: "not-an-email",
            redirectTo: "/tr/dashboard",
          },
        },
      });
    }
  }, 20000);

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
    const { signInWithEmail } = await import("~/shared/auth/login.server");

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
      locale: "tr",
      submission: {
        email: "admin@example.com",
        password: "password1234",
        redirectTo: "/dashboard",
      },
      supportedLocaleCodes: ["tr", "en"],
      t,
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
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/tr/dashboard");
    expect(response.headers.get("set-cookie")).toContain(
      "better-auth.session_token=abc",
    );
  }, 20000);

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
    const { signInWithEmail } = await import("~/shared/auth/login.server");

    createAuthMock.mockReturnValue({
      api: {
        signInEmail: signInEmailMock,
      },
    });
    findUserByEmailMock.mockResolvedValue(null);
    signInEmailMock.mockResolvedValue(authResponse);

    await expect(
      signInWithEmail({
        request,
        context: {
          db: { query: {} },
          runtime: { platform: "node" },
        } as never,
        locale: "tr",
        submission: {
          email: "enesonmezx@gmail.com",
          password: "password1234",
          redirectTo: "/dashboard",
        },
        supportedLocaleCodes: ["tr", "en"],
        t,
      }),
    ).rejects.toMatchObject({
      code: "auth.login.invalid_credentials",
      responseData: {
        errors: {
          form: "E-posta veya parola hatali.",
        },
        values: {
          email: "enesonmezx@gmail.com",
          redirectTo: "/dashboard",
        },
      },
      status: 401,
    });
  });

  it("blocks inactive users before Better Auth creates a session", async () => {
    const request = new Request("http://localhost:3000/login", {
      method: "POST",
    });
    const { signInWithEmail } = await import("~/shared/auth/login.server");

    findUserByEmailMock.mockResolvedValue({
      email: "disabled@example.com",
      id: "user-2",
      isActive: false,
      role: "author",
    });

    await expect(
      signInWithEmail({
        request,
        context: {
          db: { query: {} },
          runtime: { platform: "node" },
        } as never,
        locale: "tr",
        submission: {
          email: "disabled@example.com",
          password: "password1234",
          redirectTo: "/dashboard",
        },
        supportedLocaleCodes: ["tr", "en"],
        t,
      }),
    ).rejects.toMatchObject({
      code: "auth.login.inactive_user",
      responseData: {
        errors: {
          form: "E-posta veya parola hatali.",
        },
      },
      status: 403,
    });

    expect(createAuthMock).not.toHaveBeenCalled();
    expect(signInEmailMock).not.toHaveBeenCalled();
  }, 20000);
});
