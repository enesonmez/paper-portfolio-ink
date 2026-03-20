import type { AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../db/context";
import {
  listPublicCompanionPosts,
  getPublicPostBySlug,
  listPublicPostsPage,
} from "~/lib/posts/posts.server";

import { normalizePublicBlogPage, PUBLIC_BLOG_PAGE_SIZE } from "./public-blog.shared";

export class PublicBlogPostNotFoundError extends Error {
  readonly status = 404;

  constructor() {
    super("Published blog post not found.");
    this.name = "PublicBlogPostNotFoundError";
  }
}

export async function loadPublicBlogData(context: AppLoadContext, _request: Request) {
  const db = getDbFromContext(context);
  const result = await listPublicPostsPage(db, PUBLIC_BLOG_PAGE_SIZE, 1);

  return {
    nextPage: result.nextPage,
    posts: result.items,
  };
}

export async function loadPublicBlogFeedData(
  context: AppLoadContext,
  request: Request,
) {
  const db = getDbFromContext(context);
  const url = new URL(request.url);
  const page = normalizePublicBlogPage(url.searchParams.get("page"));
  const result = await listPublicPostsPage(db, PUBLIC_BLOG_PAGE_SIZE, page);

  return {
    nextPage: result.nextPage,
    page,
    posts: result.items,
  };
}

export async function loadPublicBlogPostData(context: AppLoadContext, slug: string) {
  const db = getDbFromContext(context);
  const post = await getPublicPostBySlug(db, slug);

  if (!post) {
    throw new PublicBlogPostNotFoundError();
  }

  const morePosts = await listPublicCompanionPosts(db, slug, 3);

  return {
    morePosts,
    post,
  };
}
