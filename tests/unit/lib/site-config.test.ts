import { siteConfig } from "~/lib/site";

describe("siteConfig", () => {
  it("exposes the minimum brand metadata for the app shell", () => {
    expect(siteConfig.name).toBe("Enes Ink");
    expect(siteConfig.url).toContain("paper-portfolio-ink");
  });
});
