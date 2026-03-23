import type { Route } from "./+types/index";
import { APP_ROUTE_ID } from "~/shared/errors/contracts";

import { runActionWithErrorHandling } from "~/shared/errors/route-error-handling.server";
import { handleDashboardResourcesAction } from "~/features/dashboard/resources/server";

export async function action({ context, request }: Route.ActionArgs) {
  return runActionWithErrorHandling({
    context,
    handler: () => handleDashboardResourcesAction(context, request),
    request,
    routeId: APP_ROUTE_ID.dashboardResourcesIndex,
  });
}

export { default } from "~/features/dashboard/resources/locales/screen";
