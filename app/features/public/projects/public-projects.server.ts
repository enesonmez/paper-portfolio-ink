import type { AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../db/context";
import {
  getPublicProjectsStats,
  listPublicProjectsPage,
} from "~/lib/projects/projects.server";

import {
  normalizePublicProjectsPage,
  PUBLIC_PROJECTS_PAGE_SIZE,
} from "./public-projects.shared";

export async function loadPublicProjectsData(
  context: AppLoadContext,
  _request: Request,
) {
  const db = getDbFromContext(context);
  const [result, stats] = await Promise.all([
    listPublicProjectsPage(db, PUBLIC_PROJECTS_PAGE_SIZE, 1),
    getPublicProjectsStats(db),
  ]);

  return {
    nextPage: result.nextPage,
    projects: result.items,
    stats,
  };
}

export async function loadPublicProjectsFeedData(
  context: AppLoadContext,
  request: Request,
) {
  const db = getDbFromContext(context);
  const url = new URL(request.url);
  const page = normalizePublicProjectsPage(url.searchParams.get("page"));
  const result = await listPublicProjectsPage(db, PUBLIC_PROJECTS_PAGE_SIZE, page);

  return {
    page,
    nextPage: result.nextPage,
    projects: result.items,
  };
}
