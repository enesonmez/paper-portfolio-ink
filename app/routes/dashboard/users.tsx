import type { Route } from "./+types/users";
import { APP_ROUTE_ID } from "~/shared/errors/contracts";

import DashboardUsersRoute, {
  DashboardUsersAccessDeniedScreen,
  DashboardUsersScreen,
} from "~/features/dashboard/users/route";
import {
  runActionWithErrorHandling,
  runLoaderWithErrorHandling,
} from "~/shared/errors/route-error-handling.server";
import {
  handleDashboardUsersAction,
  loadDashboardUsersData,
} from "~/features/dashboard/users/server";

export async function loader({ context, request }: Route.LoaderArgs) {
  return runLoaderWithErrorHandling({
    context,
    handler: () => loadDashboardUsersData(context, request),
    request,
    routeId: APP_ROUTE_ID.dashboardUsers,
  });
}

export async function action({ context, request }: Route.ActionArgs) {
  return runActionWithErrorHandling({
    context,
    handler: () => handleDashboardUsersAction(context, request),
    request,
    routeId: APP_ROUTE_ID.dashboardUsers,
  });
}

export { DashboardUsersAccessDeniedScreen, DashboardUsersScreen };

export default DashboardUsersRoute;
