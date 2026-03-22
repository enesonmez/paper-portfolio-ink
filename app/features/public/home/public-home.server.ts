import type { AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../db/context";
import { invalidateCachedData, loadCachedData } from "~/shared/cache/data-cache.server";
import { listPublicFeaturedProjects } from "~/lib/projects/projects.server";
import { listPublicSkills } from "~/lib/skills/skills.server";
import {
  buildPublicHomeCacheKey,
  PUBLIC_HOME_CACHE_OPTIONS,
  publicHomeDataSchema,
} from "./public-home.cache";

export async function loadPublicHomeData(context: AppLoadContext, request: Request) {
  return loadCachedData({
    context,
    key: buildPublicHomeCacheKey(request),
    load: async () => {
      const db = getDbFromContext(context);
      const [featuredProjects, skills] = await Promise.all([
        listPublicFeaturedProjects(db),
        listPublicSkills(db),
      ]);

      return {
        featuredProjects,
        skills,
      };
    },
    options: PUBLIC_HOME_CACHE_OPTIONS,
    schema: publicHomeDataSchema,
  });
}

export async function purgePublicHomeDataCache(
  context: Pick<AppLoadContext, "cache" | "runtime">,
  request: Request,
) {
  return invalidateCachedData(context, buildPublicHomeCacheKey(request));
}
