import type { AppLoadContext } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getSeedMessages, getSeedLocaleOptions } from "~/shared/i18n/i18n.shared";
import type * as SharedAuthLoginServerModule from "~/shared/auth/login.server";
import type * as SharedI18nServerModule from "~/shared/i18n/i18n.server";

const { getSessionForRequestMock, loadI18nPayloadMock, signInWithEmailMock } =
  vi.hoisted(() => ({
    getSessionForRequestMock: vi.fn(),
    loadI18nPayloadMock: vi.fn(),
    signInWithEmailMock: vi.fn(),
  }));

vi.mock("~/shared/auth/session.server", () => ({
  getSessionForRequest: getSessionForRequestMock,
}));

vi.mock("~/shared/i18n/i18n.server", async () => {
  const actual = await vi.importActual<typeof SharedI18nServerModule>(
    "~/shared/i18n/i18n.server",
  );

  return {
    ...actual,
    loadI18nPayload: loadI18nPayloadMock,
  };
});

vi.mock("~/shared/auth/login.server", async () => {
  const actual = await vi.importActual<typeof SharedAuthLoginServerModule>(
    "~/shared/auth/login.server",
  );

  return {
    ...actual,
    signInWithEmail: signInWithEmailMock,
  };
});

describe("login feature server", () => {
  const context = {
    db: { query: {} },
    runtime: { platform: "node" as const },
  } as unknown as AppLoadContext;

  beforeEach(() => {
    getSessionForRequestMock.mockReset();
    loadI18nPayloadMock.mockReset();
    signInWithEmailMock.mockReset();

    loadI18nPayloadMock.mockResolvedValue({
      locale: "tr",
      messages: getSeedMessages("tr"),
      supportedLocales: getSeedLocaleOptions(),
    });
  });

  it("returns a localized redirect target for unauthenticated users", async () => {
    const { loadLoginData } = await import("~/features/auth/login/server");

    getSessionForRequestMock.mockResolvedValue(null);

    await expect(
      loadLoginData(
        new Request("http://localhost:3000/login?redirectTo=%2Fdashboard%2Fprojects"),
        context,
      ),
    ).resolves.toEqual({
      redirectTo: "/tr/dashboard/projects",
    });
  });

  it("redirects authenticated users to the sanitized localized target", async () => {
    const { loadLoginData } = await import("~/features/auth/login/server");

    getSessionForRequestMock.mockResolvedValue({
      session: { id: "session-1" },
      user: { id: "user-1" },
    });

    const response = await loadLoginData(
      new Request("http://localhost:3000/login?redirectTo=%2Fdashboard%2Fposts"),
      context,
    );

    expect(response).toBeInstanceOf(Response);
    expect((response as Response).status).toBe(302);
    expect(
      (response as Response).headers.get("Location") ??
        (response as Response).headers.get("location"),
    ).toBe("/tr/dashboard/posts");
  });

  it("delegates valid submissions to signInWithEmail with normalized values", async () => {
    const { handleLoginAction } = await import("~/features/auth/login/server");
    const request = new Request("http://localhost:3000/login", {
      method: "POST",
      body: new URLSearchParams({
        email: "admin@example.com",
        password: "password1234",
        redirectTo: "/dashboard/users",
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    const response = new Response(null, {
      status: 302,
      headers: {
        location: "/tr/dashboard/users",
      },
    });

    signInWithEmailMock.mockResolvedValue(response);

    await expect(handleLoginAction(request, context)).resolves.toBe(response);

    expect(signInWithEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        context,
        locale: "tr",
        request,
        submission: {
          email: "admin@example.com",
          password: "password1234",
          redirectTo: "/tr/dashboard/users",
        },
        supportedLocaleCodes: ["tr", "en"],
      }),
    );
    const invocation = signInWithEmailMock.mock.calls[0]?.[0] as
      | { t: unknown }
      | undefined;

    expect(typeof invocation?.t).toBe("function");
  });

  it("throws a typed validation error before the auth service for invalid submissions", async () => {
    const { handleLoginAction } = await import("~/features/auth/login/server");
    const request = new Request("http://localhost:3000/login", {
      method: "POST",
      body: new URLSearchParams({
        email: "broken",
        password: "123",
        redirectTo: "/dashboard/users",
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    await expect(handleLoginAction(request, context)).rejects.toMatchObject({
      code: "auth.login.validation",
      details: {
        invalidFields: ["email", "password"],
      },
      responseData: {
        values: {
          email: "broken",
          redirectTo: "/tr/dashboard/users",
        },
      },
      status: 400,
    });
    expect(signInWithEmailMock).not.toHaveBeenCalled();
  });
});
