import type { Route } from "./+types/feed";

import { loadPublicProjectsFeedData } from "~/features/public/projects/server";

export async function loader({ context, request }: Route.LoaderArgs) {
  return loadPublicProjectsFeedData(context, request);
}
