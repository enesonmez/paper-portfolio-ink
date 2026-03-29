import { describe, expect, it, vi } from "vitest";
import type { DashboardActorSession } from "~/shared/authz/actor";

const { requireDashboardActorMock } = vi.hoisted(() => ({
  requireDashboardActorMock: vi.fn(),
}));

vi.mock("~/shared/authz/resolver.server", () => ({
  requireDashboardActor: requireDashboardActorMock,
}));

import {
  assertAnyClaimAuthorized,
  assertAuthorized,
  assertClaimAuthorized,
  withDashboardAccess,
} from "~/shared/authz/handlers.server";
import { AUTHORIZATION_CLAIM } from "~/shared/authz/model";

describe("authz handlers", () => {
  it("returns redirect responses from the shared dashboard actor resolver", async () => {
    const redirectResponse = new Response(null, { status: 302 });
    requireDashboardActorMock.mockResolvedValueOnce(redirectResponse);
    const handle = () => {
      throw new Error("Handle should not be called for redirect responses");
    };

    const result: Response = await withDashboardAccess({
      context: {} as never,
      handle,
      request: new Request("http://localhost:3000/dashboard/projects"),
    });

    expect(result).toBe(redirectResponse);
  });

  it("runs authorize and handle callbacks with the resolved dashboard auth context", async () => {
    const authorize = vi.fn();
    const auth = {
      actor: {
        authzVersion: 1,
        claims: [AUTHORIZATION_CLAIM.projectsRead],
        role: "admin",
        userId: "user-admin",
      },
      sessionUser: {
        email: "admin@example.com",
        id: "user-admin",
        name: "Admin",
        role: "admin",
      },
    } satisfies DashboardActorSession;
    const handle = vi.fn<(auth: DashboardActorSession) => { access: string }>(() => ({
      access: "granted",
    }));

    requireDashboardActorMock.mockResolvedValueOnce(auth);

    const result = await withDashboardAccess({
      authorize,
      context: {} as never,
      handle,
      request: new Request("http://localhost:3000/dashboard/projects"),
    });

    if (result instanceof Response) {
      throw new Error("Expected data result from withDashboardAccess");
    }

    expect(authorize).toHaveBeenCalledWith(auth);
    expect(handle).toHaveBeenCalledWith(auth);
    expect(result).toEqual({ access: "granted" });
  });

  it("throws a typed authorization error when a required claim is missing", () => {
    let thrownError: unknown;

    try {
      assertClaimAuthorized({
        actor: {
          authzVersion: 1,
          claims: [],
          role: "author",
          userId: "user-author",
        },
        claim: AUTHORIZATION_CLAIM.projectsRead,
        error: {
          action: "read",
          code: "projects.read.forbidden",
          message: "Project dashboard access denied",
          resource: "projects",
          responseData: {
            access: "denied",
          },
          status: 403,
        },
      });
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toMatchObject({
      code: "projects.read.forbidden",
      responseData: {
        access: "denied",
      },
      status: 403,
    });
  });

  it("supports composite policy checks through assertAuthorized", () => {
    let thrownError: unknown;

    try {
      assertAuthorized({
        error: {
          action: "read",
          code: "resources.read.forbidden",
          message: "Resource dashboard access denied",
          resource: "resources",
          responseData: {
            access: "denied",
          },
          status: 403,
        },
        isAllowed: false,
      });
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toMatchObject({
      code: "resources.read.forbidden",
      responseData: {
        access: "denied",
      },
      status: 403,
    });
  });

  it("permits any-claim checks for compound authorization rules", () => {
    expect(() =>
      assertAnyClaimAuthorized({
        actor: {
          authzVersion: 1,
          claims: [AUTHORIZATION_CLAIM.postsDeleteOwn],
          role: "author",
          userId: "user-author",
        },
        claims: [
          AUTHORIZATION_CLAIM.postsDeleteAny,
          AUTHORIZATION_CLAIM.postsDeleteOwn,
        ],
        error: {
          action: "delete",
          code: "posts.delete.forbidden",
          message: "Post delete denied",
          resource: "posts",
          responseData: {
            denied: true,
          },
          status: 403,
        },
      }),
    ).not.toThrow();
  });
});
