import type { AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../db/context";
import { listPublicFeaturedProjects } from "~/lib/projects/projects.server";

export async function loadPublicHomeData(context: AppLoadContext) {
  const db = getDbFromContext(context);

  return {
    featuredProjects: await listPublicFeaturedProjects(db),
  };
}
