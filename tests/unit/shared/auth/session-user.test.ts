import { describe, expect, it } from "vitest";

import {
  getSessionUserId,
  getSessionUserRole,
  isSessionUserActive,
  isSessionUserAdmin,
} from "~/shared/auth/session-user";

describe("session user helpers", () => {
  it("reads nested user records safely", () => {
    const session = {
      user: {
        id: " user-1 ",
        isActive: false,
        role: " admin ",
      },
    };

    expect(getSessionUserId(session)).toBe("user-1");
    expect(getSessionUserRole(session)).toBe("admin");
    expect(isSessionUserActive(session)).toBe(false);
    expect(isSessionUserAdmin(session)).toBe(true);
  });

  it("falls back safely for malformed session payloads", () => {
    expect(getSessionUserId(null)).toBeNull();
    expect(getSessionUserRole({ user: "invalid" })).toBeNull();
    expect(isSessionUserActive({ user: { isActive: "yes" } })).toBe(true);
    expect(isSessionUserAdmin({ role: "author" })).toBe(false);
  });
});
