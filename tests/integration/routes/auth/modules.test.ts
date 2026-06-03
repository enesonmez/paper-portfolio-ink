import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  handleLoginActionMock,
  loadLoginDataMock,
  performLogoutMock,
  redirectLoggedOutUsersMock,
} = vi.hoisted(() => ({
  handleLoginActionMock: vi.fn(),
  loadLoginDataMock: vi.fn(),
  performLogoutMock: vi.fn(),
  redirectLoggedOutUsersMock: vi.fn(),
}));

vi.mock("~/features/auth/login/server", () => ({
  handleLoginAction: handleLoginActionMock,
  loadLoginData: loadLoginDataMock,
}));

vi.mock("~/features/auth/logout/logout.server", () => ({
  performLogout: performLogoutMock,
  redirectLoggedOutUsers: redirectLoggedOutUsersMock,
}));

describe("auth route modules", () => {
  beforeEach(() => {
    handleLoginActionMock.mockReset();
    loadLoginDataMock.mockReset();
    performLogoutMock.mockReset();
    redirectLoggedOutUsersMock.mockReset();
  });

  it("delegates login route loader and action to the feature server", async () => {
    const request = new Request("https://paper-portfolio-ink.dev/login");
    const context = { db: { query: {} }, runtime: { platform: "node" } } as never;
    const loaderResponse = { redirectTo: "/dashboard/projects" };
    const actionResponse = new Response(null, { status: 302 });
    const { action, loader } = await import("~/routes/auth/login");

    loadLoginDataMock.mockResolvedValueOnce(loaderResponse);
    handleLoginActionMock.mockResolvedValueOnce(actionResponse);

    await expect(loader({ context, params: {}, request } as never)).resolves.toBe(
      loaderResponse,
    );
    await expect(
      action({
        context,
        params: {},
        request: new Request(request.url, {
          body: new FormData(),
          headers: {
            origin: "https://paper-portfolio-ink.dev",
          },
          method: "POST",
        }),
      } as never),
    ).resolves.toBe(actionResponse);

    expect(loadLoginDataMock).toHaveBeenCalledWith(request, context);
    expect(handleLoginActionMock).toHaveBeenCalled();
  });

  it("delegates logout route loader and action to the feature server", async () => {
    const request = new Request("https://paper-portfolio-ink.dev/logout");
    const context = { db: { query: {} }, runtime: { platform: "node" } } as never;
    const loaderResponse = new Response(null, { status: 302 });
    const actionResponse = new Response(null, { status: 302 });
    const { action, loader } = await import("~/routes/auth/logout");

    redirectLoggedOutUsersMock.mockResolvedValueOnce(loaderResponse);
    performLogoutMock.mockResolvedValueOnce(actionResponse);

    await expect(loader({ context, params: {}, request } as never)).resolves.toBe(
      loaderResponse,
    );
    await expect(
      action({
        context,
        params: {},
        request: new Request(request.url, {
          body: new FormData(),
          headers: {
            origin: "https://paper-portfolio-ink.dev",
          },
          method: "POST",
        }),
      } as never),
    ).resolves.toBe(actionResponse);

    expect(redirectLoggedOutUsersMock).toHaveBeenCalledWith(context, request);
    expect(performLogoutMock).toHaveBeenCalledTimes(1);
    const logoutInvocation = performLogoutMock.mock.calls[0]?.[0] as
      | {
          context: typeof context;
          request: Request;
        }
      | undefined;

    expect(logoutInvocation).toMatchObject({
      context,
    });
    expect(logoutInvocation?.request).toBeInstanceOf(Request);
  });

  it("rejects login and logout actions without a same-origin header", async () => {
    const context = { db: { query: {} }, runtime: { platform: "node" } } as never;
    const { action: loginAction } = await import("~/routes/auth/login");
    const { action: logoutAction } = await import("~/routes/auth/logout");

    await expect(
      loginAction({
        context,
        params: {},
        request: new Request("https://paper-portfolio-ink.dev/login", {
          body: new FormData(),
          method: "POST",
        }),
      } as never),
    ).rejects.toMatchObject({
      code: "security.csrf.invalid_origin",
      status: 403,
    });
    await expect(
      logoutAction({
        context,
        params: {},
        request: new Request("https://paper-portfolio-ink.dev/logout", {
          body: new FormData(),
          method: "POST",
        }),
      } as never),
    ).rejects.toMatchObject({
      code: "security.csrf.invalid_origin",
      status: 403,
    });

    expect(handleLoginActionMock).not.toHaveBeenCalled();
    expect(performLogoutMock).not.toHaveBeenCalled();
  });
});
