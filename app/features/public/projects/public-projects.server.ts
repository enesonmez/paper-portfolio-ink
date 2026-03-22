import type { AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../db/context";
import { invalidateCachedData, loadCachedData } from "~/shared/cache/data-cache.server";
import {
  getPublicProjectsStats,
  listPublicProjectsPage,
} from "~/lib/projects/projects.server";
import {
  buildPublicProjectsCacheKey,
  PUBLIC_PROJECTS_CACHE_OPTIONS,
  publicProjectsDataSchema,
} from "./public-projects.cache";

import {
  parsePublicProjectsCursor,
  PUBLIC_PROJECTS_PAGE_SIZE,
} from "./public-projects.shared";

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

export async function loadPublicProjectsFeedData(
  context: AppLoadContext,
  request: Request,
) {
  const db = getDbFromContext(context);
  const url = new URL(request.url);
  const rawCursor = url.searchParams.get("cursor");
  const cursor = parsePublicProjectsCursor(rawCursor);
  const result = await listPublicProjectsPage(
    db,
    PUBLIC_PROJECTS_PAGE_SIZE,
    cursor
      ? {
          createdAt: new Date(cursor.createdAtIso),
          isFeatured: cursor.isFeatured,
          slug: cursor.slug,
          sortOrder: cursor.sortOrder,
        }
      : null,
  );

  return {
    cursor: rawCursor && cursor ? rawCursor : null,
    nextCursor: result.nextCursor,
    projects: result.items,
  };
}

export async function purgePublicProjectsDataCache(
  context: Pick<AppLoadContext, "cache" | "runtime">,
  request: Request,
) {
  return invalidateCachedData(context, buildPublicProjectsCacheKey(request));
}
