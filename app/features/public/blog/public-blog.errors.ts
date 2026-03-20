export class PublicBlogPostNotFoundError extends Error {
  readonly status = 404;

  constructor() {
    super("Published blog post not found.");
    this.name = "PublicBlogPostNotFoundError";
  }
}
