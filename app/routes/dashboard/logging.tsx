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
import { APP_ROUTE_ID } from "~/shared/errors/contracts";

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
    handler: () => handleDashboardLoggingAction(context, request),
    request,
    routeId: APP_ROUTE_ID.dashboardLogging,
  });
}

export { DashboardLoggingAccessDeniedScreen, DashboardLoggingScreen };

export default DashboardLoggingRoute;
