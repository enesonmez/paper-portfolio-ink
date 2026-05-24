import { beforeEach, describe, expect, it, vi } from "vitest";

describe("auth config resolver", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("throws when no auth secret is configured", async () => {
    const { resolveAuthConfig } = await import("~/shared/auth/auth-config.server");
    const request = new Request("http://localhost:5173/login");

    expect(() => resolveAuthConfig(request)).toThrow(
      "Missing auth secret. Provide BETTER_AUTH_SECRET or AUTH_SECRET before starting the app.",
    );
  });

  it("prefers auth environment variables over the request origin defaults", async () => {
    const { resolveAuthConfig } = await import("~/shared/auth/auth-config.server");
    const request = new Request("http://localhost:5173/login");

    vi.stubEnv("BETTER_AUTH_SECRET", "0123456789-0123456789-0123456789-0123");
    vi.stubEnv("BETTER_AUTH_URL", "https://paper-portfolio-ink.test");

    expect(resolveAuthConfig(request)).toEqual({
      baseURL: "https://paper-portfolio-ink.test",
      secret: "0123456789-0123456789-0123456789-0123",
      trustedOrigins: ["https://paper-portfolio-ink.test"],
    });
  });
});
