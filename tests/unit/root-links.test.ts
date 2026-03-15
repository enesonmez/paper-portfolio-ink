import { links } from "../../app/root";

describe("root links", () => {
  it("registers the stylesheet and favicon assets", () => {
    expect(links()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ rel: "stylesheet" }),
        expect.objectContaining({
          rel: "icon",
          href: "/favicon.svg",
          type: "image/svg+xml",
        }),
      ]),
    );
  });
});
