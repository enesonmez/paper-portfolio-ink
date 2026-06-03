import type { Route } from "./+types/layout";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
  APP_ROUTE_ID,
} from "~/shared/errors/contracts";

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
import { assertSameOriginMutationRequest } from "~/shared/security/csrf.server";

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
    handler: () => {
      assertSameOriginMutationRequest({
        action: APP_ERROR_ACTION.mutate,
        code: APP_ERROR_CODE.security.csrf.invalidOrigin,
        request,
        resource: APP_ERROR_RESOURCE.resources,
      });

      return handleDashboardResourcesAction(context, request);
    },
    request,
    routeId: APP_ROUTE_ID.dashboardResourcesLayout,
  });
}

export { DashboardResourcesAccessDeniedScreen };

export default DashboardResourcesRoute;
