import { beforeEach, describe, expect, it, vi } from "vitest";

describe("auth config resolver", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("derives a safe local auth config from the request origin", async () => {
    const { resolveAuthConfig } = await import("../../app/lib/auth/auth-config.server");
    const request = new Request("http://localhost:5173/login");

    expect(resolveAuthConfig(request)).toEqual({
      baseURL: "http://localhost:5173",
      secret: "paper-enes-ink-dev-secret-0123456789",
      trustedOrigins: ["http://localhost:5173"],
    });
  });

  it("prefers auth environment variables over the development fallback", async () => {
    const { resolveAuthConfig } = await import("../../app/lib/auth/auth-config.server");
    const request = new Request("http://localhost:5173/login");

    vi.stubEnv("BETTER_AUTH_SECRET", "0123456789-0123456789-0123456789-0123");
    vi.stubEnv("BETTER_AUTH_URL", "https://paper-enes-ink.test");

    expect(resolveAuthConfig(request)).toEqual({
      baseURL: "https://paper-enes-ink.test",
      secret: "0123456789-0123456789-0123456789-0123",
      trustedOrigins: ["https://paper-enes-ink.test"],
    });
  });
});
