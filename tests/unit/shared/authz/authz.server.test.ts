import { describe, expect, it } from "vitest";

import {
  authorizationRoleClaims,
  authorizationState,
  authorizationUserClaimOverrides,
} from "#db/schema";
import { createMemoryDataCache } from "~/shared/cache/data-cache.server";
import {
  actorHasClaim,
  denyActionIfMissingClaim,
  denyLoaderIfMissingClaim,
  getAuthorizationActorFromSession,
} from "~/shared/authz/authz.server";
import {
  AUTHORIZATION_CLAIM,
  AUTHORIZATION_EFFECT,
  DEFAULT_ROLE_CLAIMS,
} from "~/shared/authz/model";

function createAuthorizationDbState() {
  const state = {
    overrides: [] as Array<{
      claimKey: string;
      effect: string;
    }>,
    revision: 1,
    roleClaims: [AUTHORIZATION_CLAIM.postsReadAny] as string[],
  };

  const calls = {
    overrides: 0,
    revision: 0,
    roleClaims: 0,
  };

  const db = {
    select(_selection: Record<string, unknown>) {
      return {
        from(table: unknown) {
          if (table === authorizationState) {
            return {
              where() {
                calls.revision += 1;

                return [{ revision: state.revision }];
              },
            };
          }

          if (table === authorizationRoleClaims) {
            return {
              orderBy() {
                calls.roleClaims += 1;

                return state.roleClaims.map((claimKey) => ({ claimKey }));
              },
              where() {
                calls.roleClaims += 1;

                return {
                  orderBy() {
                    return state.roleClaims.map((claimKey) => ({ claimKey }));
                  },
                };
              },
            };
          }

          if (table === authorizationUserClaimOverrides) {
            return {
              orderBy() {
                calls.overrides += 1;

                return state.overrides.map((override) => ({ ...override }));
              },
              where() {
                calls.overrides += 1;

                return {
                  orderBy() {
                    return state.overrides.map((override) => ({ ...override }));
                  },
                };
              },
            };
          }

          throw new Error("Unexpected table access");
        },
      };
    },
  };

  return { calls, db, state };
}

describe("authorization actor resolver", () => {
  it("falls back to default role claims when the db query API is unavailable", async () => {
    const actor = await getAuthorizationActorFromSession(
      {
        db: { query: {} },
        runtime: { platform: "node" },
      } as never,
      new Request("http://localhost:3000/dashboard"),
      {
        user: {
          authzVersion: 3,
          id: "user-author",
          role: "author",
        },
      },
    );

    expect(actor).toEqual({
      authzVersion: 3,
      claims: [...DEFAULT_ROLE_CLAIMS.author],
      role: "author",
      userId: "user-author",
    });
  });

  it("prefers explicit session claim payloads when present", async () => {
    const actor = await getAuthorizationActorFromSession(
      {
        db: { query: {} },
        runtime: { platform: "node" },
      } as never,
      new Request("http://localhost:3000/dashboard"),
      {
        user: {
          authzVersion: 7,
          claims: [AUTHORIZATION_CLAIM.projectsRead],
          id: "user-1",
          role: "author",
        },
      },
    );

    expect(actor.claims).toEqual([AUTHORIZATION_CLAIM.projectsRead]);
    expect(actorHasClaim(actor, AUTHORIZATION_CLAIM.projectsRead)).toBe(true);
  });

  it("ignores explicit session claims when the database can resolve effective claims", async () => {
    const { db } = createAuthorizationDbState();

    const actor = await getAuthorizationActorFromSession(
      {
        db,
        runtime: { platform: "node" },
      } as never,
      new Request("http://localhost:3000/dashboard"),
      {
        user: {
          authzVersion: 7,
          claims: [AUTHORIZATION_CLAIM.projectsRead],
          id: "user-1",
          role: "author",
        },
      },
    );

    expect(actor.claims).toEqual([AUTHORIZATION_CLAIM.postsReadAny]);
    expect(actorHasClaim(actor, AUTHORIZATION_CLAIM.projectsRead)).toBe(false);
  });

  it("reuses cached effective claims across requests while the revision is unchanged", async () => {
    const { calls, db } = createAuthorizationDbState();
    const context = {
      cache: createMemoryDataCache(new Map()),
      db,
      runtime: { platform: "node" },
    } as never;
    const session = {
      user: {
        authzVersion: 2,
        id: "user-1",
        role: "author",
      },
    };

    const firstActor = await getAuthorizationActorFromSession(
      context,
      new Request("http://localhost:3000/dashboard"),
      session,
    );
    const secondActor = await getAuthorizationActorFromSession(
      context,
      new Request("http://localhost:3000/dashboard"),
      session,
    );

    expect(firstActor.claims).toEqual([AUTHORIZATION_CLAIM.postsReadAny]);
    expect(secondActor.claims).toEqual([AUTHORIZATION_CLAIM.postsReadAny]);
    expect(calls.revision).toBe(2);
    expect(calls.roleClaims).toBe(1);
    expect(calls.overrides).toBe(1);
  });

  it("invalidates cached effective claims when the authorization revision changes", async () => {
    const { calls, db, state } = createAuthorizationDbState();
    const context = {
      cache: createMemoryDataCache(new Map()),
      db,
      runtime: { platform: "node" },
    } as never;
    const session = {
      user: {
        authzVersion: 4,
        id: "user-1",
        role: "author",
      },
    };

    await getAuthorizationActorFromSession(
      context,
      new Request("http://localhost:3000/dashboard"),
      session,
    );

    state.revision = 2;
    state.roleClaims = [AUTHORIZATION_CLAIM.projectsRead];
    state.overrides = [
      {
        claimKey: AUTHORIZATION_CLAIM.projectsRead,
        effect: AUTHORIZATION_EFFECT.grant,
      },
    ];

    const actor = await getAuthorizationActorFromSession(
      context,
      new Request("http://localhost:3000/dashboard"),
      session,
    );

    expect(actor.claims).toEqual([AUTHORIZATION_CLAIM.projectsRead]);
    expect(calls.revision).toBe(2);
    expect(calls.roleClaims).toBe(2);
    expect(calls.overrides).toBe(2);
  });

  it("returns the provided denied state when a loader claim is missing", () => {
    const actor = {
      authzVersion: 1,
      claims: [],
      role: "author",
      userId: "user-1",
    };

    expect(
      denyLoaderIfMissingClaim(actor, AUTHORIZATION_CLAIM.projectsRead, {
        access: "denied",
      }),
    ).toEqual({
      access: "denied",
    });
  });

  it("returns null when an action claim is satisfied", () => {
    const actor = {
      authzVersion: 1,
      claims: [AUTHORIZATION_CLAIM.projectsUpdate],
      role: "admin",
      userId: "user-1",
    };

    expect(
      denyActionIfMissingClaim(
        actor,
        AUTHORIZATION_CLAIM.projectsUpdate,
        new Response(null, { status: 403 }),
      ),
    ).toBeNull();
  });
});
