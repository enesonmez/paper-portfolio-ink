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

vi.mock("../../app/lib/auth/session.server", () => {
  return {
    getSessionForRequest: getSessionForRequestMock,
  };
});

vi.mock("../../app/lib/auth/login.server", () => {
  return import("../../app/lib/auth/login.server").then((actual) => ({
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
    const { loader } = await import("../../app/routes/login");

    getSessionForRequestMock.mockResolvedValue({
      session: { id: "session-1" },
      user: { id: "user-1" },
    });

    const response = await loader({
      request,
      context: {
        db: { query: {} },
        runtime: { platform: "node" },
      },
      params: {},
    } as never);

    expect(response).toBeInstanceOf(Response);
    expect((response as Response).status).toBe(302);
  });

  it("returns the sanitized redirect target for unauthenticated users", async () => {
    const request = new Request(
      "http://localhost:3000/login?redirectTo=%2Fdashboard%2Fprojects",
    );
    const { loader } = await import("../../app/routes/login");

    getSessionForRequestMock.mockResolvedValue(null);
    normalizeRedirectTargetMock.mockReturnValue("/dashboard/projects");

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
      redirectTo: "/dashboard/projects",
    });
  });

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
    const { action } = await import("../../app/routes/login");

    signInWithEmailMock.mockResolvedValue(response);

    await expect(
      action({
        request,
        context: {
          db: { query: {} },
          runtime: { platform: "node" },
        },
        params: {},
      } as never),
    ).resolves.toBe(response);
  });

  it("renders a neo-brutalist login form shell", async () => {
    const { LoginScreen } = await import("../../app/routes/login");
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
  });
});
