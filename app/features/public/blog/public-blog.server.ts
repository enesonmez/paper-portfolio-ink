import type { AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../db/context";
import { invalidateCachedData, loadCachedData } from "~/shared/cache/data-cache.server";
import {
  listPublicCompanionPosts,
  getPublicPostBySlug,
  listPublicPostsPage,
} from "~/lib/posts/posts.server";
import {
  buildPublicBlogCacheKey,
  PUBLIC_BLOG_CACHE_OPTIONS,
  publicBlogDataSchema,
} from "./public-blog.cache";

import { PublicBlogPostNotFoundError } from "./public-blog.errors";
import { parsePublicBlogCursor, PUBLIC_BLOG_PAGE_SIZE } from "./public-blog.shared";

export async function loadPublicBlogData(context: AppLoadContext, request: Request) {
  return loadCachedData({
    context,
    key: buildPublicBlogCacheKey(request),
    load: async () => {
      const db = getDbFromContext(context);
      const result = await listPublicPostsPage(db, PUBLIC_BLOG_PAGE_SIZE);

      return {
        nextCursor: result.nextCursor,
        posts: result.items,
      };
    },
    options: PUBLIC_BLOG_CACHE_OPTIONS,
    schema: publicBlogDataSchema,
  });
}

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

export async function purgePublicBlogDataCache(
  context: Pick<AppLoadContext, "cache" | "runtime">,
  request: Request,
) {
  return invalidateCachedData(context, buildPublicBlogCacheKey(request));
}
