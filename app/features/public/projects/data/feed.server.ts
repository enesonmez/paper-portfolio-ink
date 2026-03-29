import type { AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../../db/context";
import { listPublicProjectsPage } from "~/lib/projects/projects.server";

import { parsePublicProjectsCursor, PUBLIC_PROJECTS_PAGE_SIZE } from "./feed";

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
