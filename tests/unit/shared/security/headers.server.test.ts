import {
  applySecurityHeaders,
  buildContentSecurityPolicy,
  createCspNonce,
} from "~/shared/security/headers.server";

describe("security headers", () => {
  it("generates a nonce for CSP usage", () => {
    expect(createCspNonce()).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });

  it("builds a nonce-aware content security policy", () => {
    const nonce = "test-nonce";
    const policy = buildContentSecurityPolicy(nonce);

    expect(policy).toContain(`script-src 'self' 'nonce-${nonce}'`);
    expect(policy).toContain(
      `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`,
    );
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("object-src 'none'");
  });

  it("applies the standard security response headers", () => {
    const headers = applySecurityHeaders(new Headers(), {
      nonce: "test-nonce",
    });

    expect(headers.get("Content-Security-Policy")).toContain("'nonce-test-nonce'");
    expect(headers.get("Permissions-Policy")).toContain("camera=()");
    expect(headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(headers.get("Strict-Transport-Security")).toBe(
      "max-age=31536000; includeSubDomains; preload",
    );
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("X-Frame-Options")).toBe("DENY");
  });
});
