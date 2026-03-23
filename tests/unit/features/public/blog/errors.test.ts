import { describe, expect, it } from "vitest";

import { PUBLIC_BLOG_POST_NOT_FOUND_ERROR_NAME } from "~/features/public/blog/errors";
import { PublicBlogPostNotFoundError } from "~/features/public/blog/errors.server";

describe("public blog errors", () => {
  it("exposes a stable not-found error contract", () => {
    const error = new PublicBlogPostNotFoundError();

    expect(error.name).toBe(PUBLIC_BLOG_POST_NOT_FOUND_ERROR_NAME);
    expect(error.message).toBe("Published blog post not found.");
    expect(error.status).toBe(404);
  });
});
