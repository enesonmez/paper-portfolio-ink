import type { AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../../db/context";
import { loadCachedData } from "~/shared/cache/data-cache.server";
import { listPublicPostsPage } from "~/lib/posts/posts.server";

import {
  buildPublicBlogCacheKey,
  PUBLIC_BLOG_CACHE_OPTIONS,
  publicBlogDataSchema,
} from "./cache";
import { PUBLIC_BLOG_PAGE_SIZE } from "./feed";

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
