import type { AppLoadContext } from "react-router";

import { invalidateCachedData } from "~/shared/cache/data-cache.server";

import { buildPublicBlogCacheKey } from "./cache";

export async function purgePublicBlogDataCache(
  context: Pick<AppLoadContext, "cache" | "runtime">,
  request: Request,
) {
  return invalidateCachedData(context, buildPublicBlogCacheKey(request));
}
