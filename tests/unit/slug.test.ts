import { describe, expect, it, vi } from "vitest";

import {
  findNextAvailableSlug,
  isUniqueSlugConstraintError,
  suggestSlugFromTitle,
} from "../../app/lib/slug";

describe("slug helpers", () => {
  it("builds a normalized slug suggestion from a title", () => {
    expect(suggestSlugFromTitle(" Edge Cache Diary! ")).toBe("edge-cache-diary");
    expect(suggestSlugFromTitle("CafE CrEme Deploy")).toBe("cafe-creme-deploy");
  });

  it("finds the next available suffixed slug", async () => {
    const isTaken = vi.fn((slug: string) => {
      return Promise.resolve(
        slug === "edge-cache-diary" || slug === "edge-cache-diary-2",
      );
    });

    await expect(findNextAvailableSlug("edge-cache-diary", isTaken)).resolves.toBe(
      "edge-cache-diary-3",
    );
  });

  it("recognizes sqlite unique slug constraint errors", () => {
    expect(
      isUniqueSlugConstraintError(
        new Error("UNIQUE constraint failed: posts.slug"),
        "posts",
      ),
    ).toBe(true);
    expect(
      isUniqueSlugConstraintError(
        new Error("UNIQUE constraint failed: projects.slug"),
        "posts",
      ),
    ).toBe(false);
  });
});
