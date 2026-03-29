import type { AppLoadContext } from "react-router";

import { invalidateCachedData } from "~/shared/cache/data-cache.server";

import { buildPublicProjectsCacheKey } from "./cache";

export async function purgePublicProjectsDataCache(
  context: Pick<AppLoadContext, "cache" | "runtime">,
  request: Request,
) {
  return invalidateCachedData(context, buildPublicProjectsCacheKey(request));
}
