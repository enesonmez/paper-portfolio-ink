import type { Route } from "./+types/users";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
  APP_ROUTE_ID,
} from "~/shared/errors/contracts";

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
import { assertSameOriginMutationRequest } from "~/shared/security/csrf.server";

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
    handler: () => {
      assertSameOriginMutationRequest({
        action: APP_ERROR_ACTION.mutate,
        code: APP_ERROR_CODE.security.csrf.invalidOrigin,
        request,
        resource: APP_ERROR_RESOURCE.users,
      });

      return handleDashboardUsersAction(context, request);
    },
    request,
    routeId: APP_ROUTE_ID.dashboardUsers,
  });
}

export { DashboardUsersAccessDeniedScreen, DashboardUsersScreen };

export default DashboardUsersRoute;
