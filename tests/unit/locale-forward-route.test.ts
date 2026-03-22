import { describe, expect, it } from "vitest";

describe("locale forward route", () => {
  it("redirects legacy unprefixed deep links to the active localized path", async () => {
    const request = new Request("http://localhost:3000/blog?tag=edge");
    const { loader } = await import("../../app/routes/locale/forward");

    const response = await loader({
      request,
      context: {
        db: { query: {} },
        runtime: { platform: "node" },
      },
      params: {
        "*": "blog",
      },
    } as never);

    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/tr/blog?tag=edge");
  });

  it("returns 404 for unknown non-legacy paths instead of redirecting everything", async () => {
    const request = new Request("http://localhost:3000/unknown-page");
    const { loader } = await import("../../app/routes/locale/forward");

    const response = await loader({
      request,
      context: {
        db: { query: {} },
        runtime: { platform: "node" },
      },
      params: {
        "*": "unknown-page",
      },
    } as never);

    expect(response.status).toBe(404);
  });
});
