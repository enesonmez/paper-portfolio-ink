import type { Route } from "./+types/track";

import { trackPublicBlogPostView } from "~/features/public/blog/server";
import { runActionWithErrorHandling } from "~/shared/errors/route-error-handling.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
  APP_ROUTE_ID,
} from "~/shared/errors/contracts";
import { assertSameOriginMutationRequest } from "~/shared/security/csrf.server";

export async function action({ context, request }: Route.ActionArgs) {
  return runActionWithErrorHandling({
    context,
    handler: async () => {
      assertSameOriginMutationRequest({
        action: APP_ERROR_ACTION.track,
        code: APP_ERROR_CODE.analytics.track.invalidOrigin,
        request,
        resource: APP_ERROR_RESOURCE.analytics,
      });

      return trackPublicBlogPostView(context, request);
    },
    request,
    routeId: APP_ROUTE_ID.publicBlogTrack,
  });
}
