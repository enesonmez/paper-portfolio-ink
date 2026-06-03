import type { Route } from "./+types/projects";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
  APP_ROUTE_ID,
} from "~/shared/errors/contracts";

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
import { assertSameOriginMutationRequest } from "~/shared/security/csrf.server";

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
    handler: () => {
      assertSameOriginMutationRequest({
        action: APP_ERROR_ACTION.mutate,
        code: APP_ERROR_CODE.security.csrf.invalidOrigin,
        request,
        resource: APP_ERROR_RESOURCE.projects,
      });

      return handleDashboardProjectsAction(context, request);
    },
    request,
    routeId: APP_ROUTE_ID.dashboardProjects,
  });
}

export { DashboardProjectsAccessDeniedScreen, DashboardProjectsScreen };

export default DashboardProjectsRoute;
