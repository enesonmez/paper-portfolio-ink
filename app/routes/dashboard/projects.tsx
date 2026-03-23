import type { Route } from "./+types/projects";
import { APP_ROUTE_ID } from "~/shared/errors/contracts";

import DashboardProjectsRoute, {
  DashboardProjectsAccessDeniedScreen,
  DashboardProjectsScreen,
} from "~/features/dashboard/projects/route";
import {
  runActionWithErrorHandling,
  runLoaderWithErrorHandling,
} from "~/shared/errors/route-error-handling.server";
import {
  handleDashboardProjectsAction,
  loadDashboardProjectsData,
} from "~/features/dashboard/projects/server";

export async function loader({ context, request }: Route.LoaderArgs) {
  return runLoaderWithErrorHandling({
    context,
    handler: () => loadDashboardProjectsData(context, request),
    request,
    routeId: APP_ROUTE_ID.dashboardProjects,
  });
}

export async function action({ context, request }: Route.ActionArgs) {
  return runActionWithErrorHandling({
    context,
    handler: () => handleDashboardProjectsAction(context, request),
    request,
    routeId: APP_ROUTE_ID.dashboardProjects,
  });
}

export { DashboardProjectsAccessDeniedScreen, DashboardProjectsScreen };

export default DashboardProjectsRoute;
