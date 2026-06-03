import {
  runActionWithErrorHandling,
  runLoaderWithErrorHandling,
} from "~/shared/errors/route-error-handling.server";
import DashboardLoggingRoute, {
  DashboardLoggingAccessDeniedScreen,
  DashboardLoggingScreen,
} from "~/features/dashboard/logging/route";
import {
  handleDashboardLoggingAction,
  loadDashboardLoggingData,
} from "~/features/dashboard/logging/server";
import type { AppLoadContext } from "react-router";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
  APP_ROUTE_ID,
} from "~/shared/errors/contracts";
import { assertSameOriginMutationRequest } from "~/shared/security/csrf.server";

export async function loader({
  context,
  request,
}: {
  context: AppLoadContext;
  request: Request;
}) {
  return runLoaderWithErrorHandling({
    context,
    handler: () => loadDashboardLoggingData(context, request),
    request,
    routeId: APP_ROUTE_ID.dashboardLogging,
  });
}

export async function action({
  context,
  request,
}: {
  context: AppLoadContext;
  request: Request;
}) {
  return runActionWithErrorHandling({
    context,
    handler: () => {
      assertSameOriginMutationRequest({
        action: APP_ERROR_ACTION.mutate,
        code: APP_ERROR_CODE.security.csrf.invalidOrigin,
        request,
        resource: APP_ERROR_RESOURCE.logs,
      });

      return handleDashboardLoggingAction(context, request);
    },
    request,
    routeId: APP_ROUTE_ID.dashboardLogging,
  });
}

export { DashboardLoggingAccessDeniedScreen, DashboardLoggingScreen };

export default DashboardLoggingRoute;
