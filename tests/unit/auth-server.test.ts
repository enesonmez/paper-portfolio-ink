import { beforeEach, describe, expect, it, vi } from "vitest";

import { schema } from "../../db/schema";

const { betterAuthMock, drizzleAdapterMock } = vi.hoisted(() => {
  return {
    betterAuthMock: vi.fn(),
    drizzleAdapterMock: vi.fn(),
  };
});

vi.mock("better-auth", () => {
  return {
    betterAuth: betterAuthMock,
  };
});

vi.mock("better-auth/adapters/drizzle", () => {
  return {
    drizzleAdapter: drizzleAdapterMock,
  };
});

describe("auth server factory", () => {
  beforeEach(() => {
    betterAuthMock.mockReset();
    drizzleAdapterMock.mockReset();
  });

  it("creates Better Auth with the shared Drizzle schema and custom table mappings", async () => {
    const db = { query: {} };
    const adapter = { type: "drizzle-adapter" };
    const authInstance = { handler: vi.fn(), api: { getSession: vi.fn() } };
    const { createAuth } = await import("../../app/lib/auth/auth.server");

    drizzleAdapterMock.mockReturnValue(adapter);
    betterAuthMock.mockReturnValue(authInstance);

    expect(
      createAuth({
        db: db as never,
        secret: "test-secret",
        baseURL: "http://localhost:3000",
        trustedOrigins: ["http://localhost:3000"],
      }),
    ).toBe(authInstance);

    expect(drizzleAdapterMock).toHaveBeenCalledWith(db, {
      provider: "sqlite",
      schema,
    });
    expect(betterAuthMock).toHaveBeenCalledWith(
      expect.objectContaining({
        database: adapter,
        secret: "test-secret",
        baseURL: "http://localhost:3000",
        trustedOrigins: ["http://localhost:3000"],
        emailAndPassword: { enabled: true },
        user: {
          modelName: "users",
          fields: {
            name: "display_name",
            image: "avatar_url",
          },
        },
        session: {
          modelName: "sessions",
          fields: {
            userId: "user_id",
          },
        },
        account: {
          modelName: "accounts",
          fields: {
            userId: "user_id",
            accountId: "account_id",
            providerId: "provider_id",
            accessToken: "access_token",
            refreshToken: "refresh_token",
            idToken: "id_token",
            accessTokenExpiresAt: "access_token_expires_at",
            refreshTokenExpiresAt: "refresh_token_expires_at",
          },
        },
        verification: {
          modelName: "verifications",
        },
      }),
    );
  });

  it("derives a safe local auth config from the request origin", async () => {
    const { resolveAuthConfig } = await import("../../app/lib/auth/auth.server");
    const request = new Request("http://localhost:5173/login");

    expect(resolveAuthConfig(request)).toEqual({
      baseURL: "http://localhost:5173",
      secret: "dev-only-better-auth-secret",
      trustedOrigins: ["http://localhost:5173"],
    });
  });
});
