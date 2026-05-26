import { describe, expect, it } from "vitest";

describe("cloudflare analytics env resolver", () => {
  it("maps the analytics secret binding into a runtime override", async () => {
    const { resolveCloudflareAnalyticsConfig } = await import("#workers/analytics-env");

    expect(
      resolveCloudflareAnalyticsConfig({
        ANALYTICS_SECRET: "analytics-secret",
      }),
    ).toEqual({
      secret: "analytics-secret",
    });
  });

  it("returns undefined when no analytics binding exists", async () => {
    const { resolveCloudflareAnalyticsConfig } = await import("#workers/analytics-env");

    expect(resolveCloudflareAnalyticsConfig({})).toBeUndefined();
  });
});
