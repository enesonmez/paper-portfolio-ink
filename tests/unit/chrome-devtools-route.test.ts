import { loader } from "../../app/routes/system/chrome-devtools";

describe("chrome devtools well-known route", () => {
  it("returns a JSON response for local DevTools probes", async () => {
    const response = loader();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("application/json");
    await expect(response.json()).resolves.toEqual({
      workspace: "paper-portfolio-ink",
    });
  });
});
