import type { AppLoadContext } from "react-router";

import { invalidateCachedData } from "~/shared/cache/data-cache.server";

import { buildPublicHomeCacheKey } from "./cache";

export async function purgePublicHomeDataCache(
  context: Pick<AppLoadContext, "cache" | "runtime">,
  request: Request,
) {
  return invalidateCachedData(context, buildPublicHomeCacheKey(request));
}
