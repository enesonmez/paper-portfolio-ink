import type { Route } from "./+types/feed";
import { APP_ROUTE_ID } from "~/shared/errors/contracts";

import { runLoaderWithErrorHandling } from "~/shared/errors/route-error-handling.server";
import { loadPublicBlogFeedData } from "~/features/public/blog/server";

export async function loader({ context, request }: Route.LoaderArgs) {
  return runLoaderWithErrorHandling({
    context,
    handler: () => loadPublicBlogFeedData(context, request),
    request,
    routeId: APP_ROUTE_ID.publicBlogFeed,
  });
}
