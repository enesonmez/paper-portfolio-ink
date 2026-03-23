import type { Route } from "./+types/posts";
import { APP_ROUTE_ID } from "~/shared/errors/contracts";

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
    handler: () => handleDashboardPostsAction(context, request),
    request,
    routeId: APP_ROUTE_ID.dashboardPosts,
  });
}

export { DashboardPostsAccessDeniedScreen, DashboardPostsScreen };

export default DashboardPostsRoute;
