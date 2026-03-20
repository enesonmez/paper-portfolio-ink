import type { Route } from "./+types/blog.feed";

import { loadPublicBlogFeedData } from "~/features/public/blog/public-blog.server";

export async function loader({ context, request }: Route.LoaderArgs) {
  return loadPublicBlogFeedData(context, request);
}
