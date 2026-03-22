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
    vi.unstubAllEnvs();
  });

  it("creates Better Auth with the shared Drizzle schema and custom table mappings", async () => {
    const db = { query: {} };
    const adapter = { type: "drizzle-adapter" };
    const authInstance = { handler: vi.fn(), api: { getSession: vi.fn() } };
    const { createAuth } = await import("../../app/shared/auth/auth.server");

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
            name: "displayName",
            image: "avatarUrl",
          },
          additionalFields: {
            isActive: {
              type: "boolean",
              input: false,
              required: false,
            },
            role: {
              type: "string",
              input: false,
              required: false,
            },
          },
        },
        session: {
          modelName: "sessions",
        },
        account: {
          modelName: "accounts",
        },
        verification: {
          modelName: "verifications",
        },
      }),
    );
  });
});
