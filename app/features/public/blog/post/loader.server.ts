import type { AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../../db/context";
import {
  getPublicPostBySlug,
  listPublicCompanionPosts,
} from "~/lib/posts/posts.server";

import { PublicBlogPostNotFoundError } from "./errors.server";

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
