import { loader } from "../../app/routes/system/favicon";

describe("favicon.ico route", () => {
  it("redirects legacy favicon requests to the svg asset", () => {
    const response = loader();

    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe("/favicon.svg");
  });
});
