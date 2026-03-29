import type { AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../../db/context";
import { listPublicPostsPage } from "~/lib/posts/posts.server";

import { parsePublicBlogCursor, PUBLIC_BLOG_PAGE_SIZE } from "./feed";

export async function loadPublicBlogFeedData(
  context: AppLoadContext,
  request: Request,
) {
  const db = getDbFromContext(context);
  const url = new URL(request.url);
  const rawCursor = url.searchParams.get("cursor");
  const cursor = parsePublicBlogCursor(rawCursor);
  const result = await listPublicPostsPage(
    db,
    PUBLIC_BLOG_PAGE_SIZE,
    cursor
      ? {
          createdAt: new Date(cursor.createdAtIso),
          publishedAt: new Date(cursor.publishedAtIso),
          slug: cursor.slug,
          updatedAt: new Date(cursor.updatedAtIso),
        }
      : null,
  );

  return {
    cursor: rawCursor && cursor ? rawCursor : null,
    nextCursor: result.nextCursor,
    posts: result.items,
  };
}
