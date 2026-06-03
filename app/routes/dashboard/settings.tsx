import type { AppLoadContext } from "react-router";

import DashboardSettingsRoute, {
  DashboardSettingsAccessDeniedScreen,
  DashboardSettingsScreen,
} from "~/features/dashboard/settings/route";
import {
  handleDashboardSettingsAction,
  loadDashboardSettingsData,
} from "~/features/dashboard/settings/server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
  APP_ROUTE_ID,
} from "~/shared/errors/contracts";
import {
  runActionWithErrorHandling,
  runLoaderWithErrorHandling,
} from "~/shared/errors/route-error-handling.server";
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
    handler: () => {
      assertSameOriginMutationRequest({
        action: APP_ERROR_ACTION.mutate,
        code: APP_ERROR_CODE.security.csrf.invalidOrigin,
        request,
        resource: APP_ERROR_RESOURCE.settings,
      });

      return handleDashboardSettingsAction(context, request);
    },
    request,
    routeId: APP_ROUTE_ID.dashboardSettings,
  });
}

export { DashboardSettingsAccessDeniedScreen, DashboardSettingsScreen };

export default DashboardSettingsRoute;
