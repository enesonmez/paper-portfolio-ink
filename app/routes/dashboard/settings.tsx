import type { AppLoadContext } from "react-router";

import DashboardSettingsRoute, {
  DashboardSettingsAccessDeniedScreen,
  DashboardSettingsScreen,
} from "~/features/dashboard/settings/route";
import {
  handleDashboardSettingsAction,
  loadDashboardSettingsData,
} from "~/features/dashboard/settings/server";
import { APP_ROUTE_ID } from "~/shared/errors/contracts";
import {
  runActionWithErrorHandling,
  runLoaderWithErrorHandling,
} from "~/shared/errors/route-error-handling.server";

export async function loader({
  context,
  request,
}: {
  context: AppLoadContext;
  request: Request;
}) {
  return runLoaderWithErrorHandling({
    context,
    handler: () => loadDashboardSettingsData(context, request),
    request,
    routeId: APP_ROUTE_ID.dashboardSettings,
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
    handler: () => handleDashboardSettingsAction(context, request),
    request,
    routeId: APP_ROUTE_ID.dashboardSettings,
  });
}

export { DashboardSettingsAccessDeniedScreen, DashboardSettingsScreen };

export default DashboardSettingsRoute;
