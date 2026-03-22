import { describe, expect, it } from "vitest";

import {
  actorHasClaim,
  denyActionIfMissingClaim,
  denyLoaderIfMissingClaim,
  getAuthorizationActorFromSession,
} from "~/shared/authz/authz.server";
import { AUTHORIZATION_CLAIM, DEFAULT_ROLE_CLAIMS } from "~/shared/authz/model";

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
