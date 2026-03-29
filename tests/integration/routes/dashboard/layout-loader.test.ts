import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DashboardActorSession } from "~/shared/authz/actor";

const { requireDashboardActorMock, withDashboardAccessMock } = vi.hoisted(() => {
  return {
    requireDashboardActorMock: vi.fn(),
    withDashboardAccessMock: vi.fn(),
  };
});

vi.mock("~/shared/authz/authz.server", () => {
  return {
    requireDashboardActor: requireDashboardActorMock,
    withDashboardAccess: withDashboardAccessMock,
  };
});

describe("dashboard route guard", () => {
  beforeEach(() => {
    requireDashboardActorMock.mockReset();
    withDashboardAccessMock.mockReset();
  });

  it("enforces a server-side session check in the dashboard parent loader", async () => {
    const request = new Request("http://localhost:3000/dashboard");
    const { loader } = await import("~/routes/dashboard/layout");
    type DashboardContext = {
      db: {
        query: Record<string, never>;
      };
      runtime: {
        platform: "node";
      };
    };

    const auth = {
      actor: {
        authzVersion: 1,
        claims: ["dashboard.access", "users.read"],
        role: "admin",
        userId: "user-1",
      },
      sessionUser: {
        id: "user-1",
        name: "Enes Admin",
        email: "admin@paper-portfolio-ink.local",
        role: "admin",
      },
    } satisfies DashboardActorSession;

    requireDashboardActorMock.mockResolvedValue(auth);
    withDashboardAccessMock.mockImplementation(
      async ({
        context,
        handle,
        request,
      }: {
        context: DashboardContext;
        handle: (auth: DashboardActorSession) => unknown;
        request: Request;
      }) => {
        const resolvedAuth = auth;

        await requireDashboardActorMock(context, request);

        return handle(resolvedAuth);
      },
    );

    const context = {
      db: { query: {} as Record<string, never> },
      runtime: { platform: "node" as const },
    } satisfies DashboardContext;

    await expect(
      loader({
        request,
        context,
        params: {},
      } as never),
    ).resolves.toEqual({
      user: {
        displayName: "Enes Admin",
        email: "admin@paper-portfolio-ink.local",
        claims: ["dashboard.access", "users.read"],
        id: "user-1",
        initials: "EA",
        role: "admin",
      },
    });

    const firstCall = withDashboardAccessMock.mock.calls[0]?.[0] as
      | {
          context: DashboardContext;
          request: Request;
        }
      | undefined;

    expect(firstCall).toBeDefined();
    expect(firstCall?.context).toEqual(context);
    expect(firstCall?.request).toBe(request);
  }, 20000);
});
