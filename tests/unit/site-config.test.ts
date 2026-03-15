import { siteConfig } from "../../app/lib/site";

describe("siteConfig", () => {
  it("exposes the minimum brand metadata for the app shell", () => {
    expect(siteConfig.locale).toBe("tr");
    expect(siteConfig.name).toBe("Enes Ink");
    expect(siteConfig.title).toContain("Portfolio");
    expect(siteConfig.description).toContain("Cloudflare");
  });
});

