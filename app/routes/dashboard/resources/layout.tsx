import type { Route } from "./+types/layout";
import { APP_ROUTE_ID } from "~/shared/errors/contracts";

import DashboardResourcesRoute, {
  DashboardResourcesAccessDeniedScreen,
} from "~/features/dashboard/resources/route";
import {
  runActionWithErrorHandling,
  runLoaderWithErrorHandling,
} from "~/shared/errors/route-error-handling.server";
import {
  handleDashboardResourcesAction,
  loadDashboardResourcesData,
} from "~/features/dashboard/resources/server";

export async function loader({ context, request }: Route.LoaderArgs) {
  return runLoaderWithErrorHandling({
    context,
    handler: () => loadDashboardResourcesData(context, request),
    request,
    routeId: APP_ROUTE_ID.dashboardResourcesLayout,
  });
}

export async function action({ context, request }: Route.ActionArgs) {
  return runActionWithErrorHandling({
    context,
    handler: () => handleDashboardResourcesAction(context, request),
    request,
    routeId: APP_ROUTE_ID.dashboardResourcesLayout,
  });
}

export { DashboardResourcesAccessDeniedScreen };

export default DashboardResourcesRoute;
