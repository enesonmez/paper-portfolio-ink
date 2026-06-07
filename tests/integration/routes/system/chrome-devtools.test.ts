import { loader } from "~/routes/system/chrome-devtools";

describe("chrome devtools well-known route", () => {
  it("returns a JSON response for local DevTools probes", async () => {
    const response = loader({
      context: {
        runtime: { platform: "node" },
      },
      params: {},
      request: new Request(
        "http://localhost:3000/.well-known/appspecific.com.chrome.devtools.json",
      ),
    } as never);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("application/json");
    await expect(response.json()).resolves.toEqual({
      workspace: "paper-portfolio-ink",
    });
  });

  it("keeps the endpoint available for local Cloudflare probes", async () => {
    const response = loader({
      context: {
        runtime: { platform: "cloudflare" },
      },
      params: {},
      request: new Request(
        "http://127.0.0.1:4173/.well-known/appspecific.com.chrome.devtools.json",
      ),
    } as never);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      workspace: "paper-portfolio-ink",
    });
  });

  it("returns 404 for non-local Cloudflare requests", () => {
    const response = loader({
      context: {
        runtime: { platform: "cloudflare" },
      },
      params: {},
      request: new Request(
        "https://paper-portfolio-ink.dev/.well-known/appspecific.com.chrome.devtools.json",
      ),
    } as never);

    expect(response.status).toBe(404);
  });
});
