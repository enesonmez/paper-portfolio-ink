import type { AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../db/context";
import { listPublicFeaturedProjects } from "~/lib/projects/projects.server";
import { listPublicSkills } from "~/lib/skills/skills.server";

export async function loadPublicHomeData(context: AppLoadContext) {
  const db = getDbFromContext(context);
  const [featuredProjects, skills] = await Promise.all([
    listPublicFeaturedProjects(db),
    listPublicSkills(db),
  ]);

  return {
    featuredProjects,
    skills,
  };
}
