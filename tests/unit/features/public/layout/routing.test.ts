import { describe, expect, it } from "vitest";

import { isPublicPathname } from "~/features/public/layout/routing";

describe("public pathname helpers", () => {
  it("recognizes public routes with or without locale prefixes", () => {
    expect(isPublicPathname("/")).toBe(true);
    expect(isPublicPathname("/tr/projects")).toBe(true);
    expect(isPublicPathname("/en/blog/edge-observability")).toBe(true);
    expect(isPublicPathname("/dashboard")).toBe(false);
    expect(isPublicPathname("/tr/login")).toBe(false);
  });
});
