import type { Route } from "./+types/projects.feed";

import { loadPublicProjectsFeedData } from "~/features/public/projects/public-projects.server";

export async function loader({ context, request }: Route.LoaderArgs) {
  return loadPublicProjectsFeedData(context, request);
}
