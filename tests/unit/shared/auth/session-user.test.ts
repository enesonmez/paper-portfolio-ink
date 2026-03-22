import { describe, expect, it } from "vitest";

import {
  getAuthorizationClaimSet,
  getSessionUserAuthzVersion,
  getSessionUserId,
  getSessionUserRole,
  getSessionUserSnapshot,
  isSessionUserActive,
  isSessionUserAdmin,
} from "~/shared/auth/session-user";

describe("session user helpers", () => {
  it("reads nested user records safely", () => {
    const session = {
      user: {
        authzVersion: 4,
        claims: ["dashboard.access", "posts.create"],
        id: " user-1 ",
        isActive: false,
        role: " admin ",
      },
    };

    expect(getSessionUserId(session)).toBe("user-1");
    expect(getSessionUserRole(session)).toBe("admin");
    expect(getSessionUserAuthzVersion(session)).toBe(4);
    expect(getAuthorizationClaimSet(session)).toEqual([
      "dashboard.access",
      "posts.create",
    ]);
    expect(isSessionUserActive(session)).toBe(false);
    expect(isSessionUserAdmin(session)).toBe(true);
  });

  it("falls back safely for malformed session payloads", () => {
    expect(getSessionUserId(null)).toBeNull();
    expect(getSessionUserRole({ user: "invalid" })).toBeNull();
    expect(getSessionUserAuthzVersion({ user: { authzVersion: "4" } })).toBe(1);
    expect(getAuthorizationClaimSet({ user: { claims: "invalid" } })).toEqual([]);
    expect(isSessionUserActive({ user: { isActive: "yes" } })).toBe(true);
    expect(isSessionUserAdmin({ role: "author" })).toBe(false);
  });

  it("returns a copyable user snapshot for downstream auth helpers", () => {
    expect(
      getSessionUserSnapshot({
        user: {
          email: "admin@paper-portfolio-ink.local",
          id: "user-1",
          role: "admin",
        },
      }),
    ).toEqual({
      email: "admin@paper-portfolio-ink.local",
      id: "user-1",
      role: "admin",
    });
  });
});
