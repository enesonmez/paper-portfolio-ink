import {
  buildPrimaryContactHref,
  buildPublicSocialLinks,
  buildSiteConfig,
  siteConfig,
} from "~/lib/site";

describe("site helpers", () => {
  it("exposes the default brand metadata for fallback rendering", () => {
    expect(siteConfig.name).toBe("Paper Ink");
    expect(siteConfig.url).toContain("paper-portfolio-ink");
  });

  it("builds site metadata and public links from configuration values", () => {
    const configuration = {
      "contact.email": "contact@example.dev",
      "site.domainUrl": "https://portfolio.example.dev",
      "site.name": "Example Portfolio",
      "social.github": "https://github.com/example",
      "social.instagram": "https://instagram.com/example",
      "social.linkedin": "https://linkedin.com/in/example",
      "social.x": "https://x.com/example",
    } as const;

    expect(buildSiteConfig(configuration)).toEqual({
      name: "Example Portfolio",
      url: "https://portfolio.example.dev",
    });
    expect(buildPrimaryContactHref(configuration)).toBe("mailto:contact@example.dev");
    expect(buildPublicSocialLinks(configuration)).toEqual([
      {
        href: "https://github.com/example",
        key: "github",
      },
      {
        href: "https://linkedin.com/in/example",
        key: "linkedin",
      },
      {
        href: "https://x.com/example",
        key: "x",
      },
      {
        href: "https://instagram.com/example",
        key: "instagram",
      },
      {
        href: "mailto:contact@example.dev",
        key: "mail",
      },
    ]);
  });

  it("omits optional social links when their configuration value is empty", () => {
    expect(
      buildPublicSocialLinks({
        "contact.email": "contact@example.dev",
        "social.github": "https://github.com/example",
        "social.instagram": "",
        "social.linkedin": "   ",
        "social.x": "",
      }),
    ).toEqual([
      {
        href: "https://github.com/example",
        key: "github",
      },
      {
        href: "mailto:contact@example.dev",
        key: "mail",
      },
    ]);
  });
});
