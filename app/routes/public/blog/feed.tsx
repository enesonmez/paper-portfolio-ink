import type { Route } from "./+types/feed";

import { loadPublicBlogFeedData } from "~/features/public/blog/server";

export async function loader({ context, request }: Route.LoaderArgs) {
  return loadPublicBlogFeedData(context, request);
}
