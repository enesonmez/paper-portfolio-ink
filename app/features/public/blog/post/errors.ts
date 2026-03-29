export const PUBLIC_BLOG_POST_NOT_FOUND_ERROR_NAME = "PublicBlogPostNotFoundError";

export function isPublicBlogPostNotFoundError(error: unknown) {
  return error instanceof Error && error.name === PUBLIC_BLOG_POST_NOT_FOUND_ERROR_NAME;
}
