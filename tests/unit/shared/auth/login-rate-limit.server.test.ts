import { describe, expect, it } from "vitest";

import {
  isLoginRateLimitActive,
  resolveNextLoginRateLimitState,
  shouldTrackLoginRateLimitFailure,
} from "~/shared/auth/login-rate-limit.server";
import { buildAuthorizationError } from "~/shared/errors/builders.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";

describe("login rate limit helpers", () => {
  it("starts a fresh failure window for the first failed login attempt", () => {
    const now = new Date("2026-05-24T10:00:00.000Z");
    const nextState = resolveNextLoginRateLimitState(null, "email", now);

    expect(nextState).toEqual({
      blockedUntil: null,
      failureCount: 1,
      windowStartedAt: now,
    });
  });

  it("blocks the email scope after the configured number of failures", () => {
    const now = new Date("2026-05-24T10:00:00.000Z");
    const nextState = resolveNextLoginRateLimitState(
      {
        blockedUntil: null,
        failureCount: 4,
        windowStartedAt: new Date("2026-05-24T09:55:00.000Z"),
      },
      "email",
      now,
    );

    expect(nextState.failureCount).toBe(5);
    expect(nextState.blockedUntil?.toISOString()).toBe("2026-05-24T10:15:00.000Z");
    expect(isLoginRateLimitActive(nextState, now)).toBe(true);
  });

  it("resets expired windows instead of carrying over stale failures", () => {
    const now = new Date("2026-05-24T10:20:00.000Z");
    const nextState = resolveNextLoginRateLimitState(
      {
        blockedUntil: null,
        failureCount: 3,
        windowStartedAt: new Date("2026-05-24T10:00:00.000Z"),
      },
      "ip",
      now,
    );

    expect(nextState).toEqual({
      blockedUntil: null,
      failureCount: 1,
      windowStartedAt: now,
    });
  });

  it("tracks only credential-style login failures in the throttle pipeline", () => {
    const invalidCredentialsError = buildAuthorizationError({
      action: APP_ERROR_ACTION.login,
      code: APP_ERROR_CODE.auth.login.invalidCredentials,
      message: "Invalid credentials",
      resource: APP_ERROR_RESOURCE.authLogin,
      status: 401,
    });
    const rateLimitedError = buildAuthorizationError({
      action: APP_ERROR_ACTION.login,
      code: APP_ERROR_CODE.auth.login.rateLimited,
      message: "Rate limited",
      resource: APP_ERROR_RESOURCE.authLogin,
      status: 429,
    });

    expect(shouldTrackLoginRateLimitFailure(invalidCredentialsError)).toBe(true);
    expect(shouldTrackLoginRateLimitFailure(rateLimitedError)).toBe(false);
    expect(shouldTrackLoginRateLimitFailure(new Error("boom"))).toBe(false);
  });
});
