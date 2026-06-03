import type { Route } from "./+types/posts";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
  APP_ROUTE_ID,
} from "~/shared/errors/contracts";

import DashboardPostsRoute, {
  DashboardPostsAccessDeniedScreen,
  DashboardPostsScreen,
} from "~/features/dashboard/posts/route";
import {
  runActionWithErrorHandling,
  runLoaderWithErrorHandling,
} from "~/shared/errors/route-error-handling.server";
import {
  handleDashboardPostsAction,
  loadDashboardPostsData,
} from "~/features/dashboard/posts/server";
import { assertSameOriginMutationRequest } from "~/shared/security/csrf.server";

export async function loader({ context, request }: Route.LoaderArgs) {
  return runLoaderWithErrorHandling({
    context,
    handler: () => loadDashboardPostsData(context, request),
    request,
    routeId: APP_ROUTE_ID.dashboardPosts,
  });
}

export async function action({ context, request }: Route.ActionArgs) {
  return runActionWithErrorHandling({
    context,
    handler: () => {
      assertSameOriginMutationRequest({
        action: APP_ERROR_ACTION.mutate,
        code: APP_ERROR_CODE.security.csrf.invalidOrigin,
        request,
        resource: APP_ERROR_RESOURCE.posts,
      });

      return handleDashboardPostsAction(context, request);
    },
    request,
    routeId: APP_ROUTE_ID.dashboardPosts,
  });
}

export { DashboardPostsAccessDeniedScreen, DashboardPostsScreen };

export default DashboardPostsRoute;
