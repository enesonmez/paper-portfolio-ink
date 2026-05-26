import type { Route } from "./+types/track";

import { trackPublicBlogPostView } from "~/features/public/blog/server";
import { runActionWithErrorHandling } from "~/shared/errors/route-error-handling.server";
import { APP_ROUTE_ID } from "~/shared/errors/contracts";

export async function action({ context, request }: Route.ActionArgs) {
  return runActionWithErrorHandling({
    context,
    handler: async () => trackPublicBlogPostView(context, request),
    request,
    routeId: APP_ROUTE_ID.publicBlogTrack,
  });
}
