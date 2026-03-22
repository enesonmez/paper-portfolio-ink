import { describe, expect, it } from "vitest";

import { PublicBlogPostNotFoundError } from "~/features/public/blog/errors";

describe("public blog errors", () => {
  it("exposes a stable not-found error contract", () => {
    const error = new PublicBlogPostNotFoundError();

    expect(error.name).toBe("PublicBlogPostNotFoundError");
    expect(error.message).toBe("Published blog post not found.");
    expect(error.status).toBe(404);
  });
});
