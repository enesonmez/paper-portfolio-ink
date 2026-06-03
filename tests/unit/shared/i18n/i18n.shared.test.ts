import { describe, expect, it } from "vitest";

import { buildLocaleCookie, getLocaleCookie } from "~/shared/i18n/i18n.shared";

describe("i18n shared cookie helpers", () => {
  it("reads locale values from the host-only cookie name", () => {
    const request = new Request("https://paper-portfolio-ink.dev/", {
      headers: {
        Cookie: "__Host-paper-locale=en",
      },
    });

    expect(getLocaleCookie(request, ["tr", "en"], "tr")).toBe("en");
  });

  it("builds a secure host-only locale cookie", () => {
    const cookie = buildLocaleCookie("en");

    expect(cookie).toContain("__Host-paper-locale=en");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain("Secure");
    expect(cookie).toContain("SameSite=Lax");
  });
});
