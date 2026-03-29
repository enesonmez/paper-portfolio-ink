import type { AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../../db/context";
import { loadCachedData } from "~/shared/cache/data-cache.server";
import {
  getPublicProjectsStats,
  listPublicProjectsPage,
} from "~/lib/projects/projects.server";

import {
  buildPublicProjectsCacheKey,
  PUBLIC_PROJECTS_CACHE_OPTIONS,
  publicProjectsDataSchema,
} from "./cache";
import { PUBLIC_PROJECTS_PAGE_SIZE } from "./feed";

export async function loadPublicProjectsData(
  context: AppLoadContext,
  request: Request,
) {
  return loadCachedData({
    context,
    key: buildPublicProjectsCacheKey(request),
    load: async () => {
      const db = getDbFromContext(context);
      const [result, stats] = await Promise.all([
        listPublicProjectsPage(db, PUBLIC_PROJECTS_PAGE_SIZE),
        getPublicProjectsStats(db),
      ]);

      return {
        nextCursor: result.nextCursor,
        projects: result.items,
        stats,
      };
    },
    options: PUBLIC_PROJECTS_CACHE_OPTIONS,
    schema: publicProjectsDataSchema,
  });
}
