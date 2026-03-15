import { describe, expect, it } from "vitest";

describe("cloudflare auth env resolver", () => {
  it("maps Cloudflare secret bindings into an auth override", async () => {
    const request = new Request("https://paper-enes-ink.dev/dashboard");
    const { resolveCloudflareAuthConfig } = await import("../../workers/auth-env");

    expect(
      resolveCloudflareAuthConfig(
        {
          BETTER_AUTH_SECRET: "0123456789-0123456789-0123456789-0123",
          BETTER_AUTH_URL: "https://paper-enes-ink.dev",
        },
        request,
      ),
    ).toEqual({
      baseURL: "https://paper-enes-ink.dev",
      secret: "0123456789-0123456789-0123456789-0123",
      trustedOrigins: ["https://paper-enes-ink.dev"],
    });
  });

  it("returns undefined when no Cloudflare auth bindings exist", async () => {
    const request = new Request("https://paper-enes-ink.dev/dashboard");
    const { resolveCloudflareAuthConfig } = await import("../../workers/auth-env");

    expect(resolveCloudflareAuthConfig({}, request)).toBeUndefined();
  });
});
