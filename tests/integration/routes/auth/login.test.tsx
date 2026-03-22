import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getSessionForRequestMock, signInWithEmailMock, normalizeRedirectTargetMock } =
  vi.hoisted(() => {
    return {
      getSessionForRequestMock: vi.fn(),
      signInWithEmailMock: vi.fn(),
      normalizeRedirectTargetMock: vi.fn((value?: string) => value ?? "/dashboard"),
    };
  });

vi.mock("~/shared/auth/session.server", () => {
  return {
    getSessionForRequest: getSessionForRequestMock,
  };
});

vi.mock("~/shared/auth/login.server", () => {
  return import("~/shared/auth/login.server").then((actual) => ({
    ...actual,
    normalizeRedirectTarget: normalizeRedirectTargetMock,
    signInWithEmail: signInWithEmailMock,
  }));
});

describe("login route", () => {
  beforeEach(() => {
    getSessionForRequestMock.mockReset();
    signInWithEmailMock.mockReset();
    normalizeRedirectTargetMock.mockClear();
  });

  it("redirects authenticated users away from the login page", async () => {
    const request = new Request("http://localhost:3000/login");
    const { loadLoginData } = await import("~/features/auth/login/server");

    getSessionForRequestMock.mockResolvedValue({
      session: { id: "session-1" },
      user: { id: "user-1" },
    });

    const response = await loadLoginData(request, {
      db: { query: {} },
      runtime: { platform: "node" },
    } as never);

    expect(response).toBeInstanceOf(Response);
    expect((response as Response).status).toBe(302);
  }, 20000);

  it("returns the sanitized redirect target for unauthenticated users", async () => {
    const request = new Request(
      "http://localhost:3000/login?redirectTo=%2Fdashboard%2Fprojects",
    );
    const { loadLoginData } = await import("~/features/auth/login/server");

    getSessionForRequestMock.mockResolvedValue(null);
    normalizeRedirectTargetMock.mockReturnValue("/dashboard/projects");

    await expect(
      loadLoginData(request, {
        db: { query: {} },
        runtime: { platform: "node" },
      } as never),
    ).resolves.toEqual({
      redirectTo: "/dashboard/projects",
    });
  }, 20000);

  it("delegates valid form submissions to the login auth service", async () => {
    const formData = new FormData();
    formData.set("email", "admin@example.com");
    formData.set("password", "password1234");
    formData.set("redirectTo", "/dashboard");

    const request = new Request("http://localhost:3000/login", {
      method: "POST",
      body: formData,
    });
    const response = new Response(null, {
      status: 302,
      headers: {
        location: "/dashboard",
      },
    });
    const { handleLoginAction } = await import("~/features/auth/login/server");

    signInWithEmailMock.mockResolvedValue(response);

    await expect(
      handleLoginAction(request, {
        db: { query: {} },
        runtime: { platform: "node" },
      } as never),
    ).resolves.toBe(response);
  }, 20000);

  it("renders a neo-brutalist login form shell", async () => {
    const { LoginScreen } = await import("~/routes/auth/login");
    const router = createMemoryRouter(
      [
        {
          path: "/login",
          element: <LoginScreen values={{ email: "", redirectTo: "/dashboard" }} />,
        },
      ],
      {
        initialEntries: ["/login"],
      },
    );

    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Access Admins Only",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Security Level: Alpha")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Login_To_Terminal" }),
    ).toBeInTheDocument();
  }, 20000);
});
