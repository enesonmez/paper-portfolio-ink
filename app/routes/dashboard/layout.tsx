import type { Route } from "./+types/layout";
import { APP_ROUTE_ID } from "~/shared/errors/contracts";

import DashboardLayoutRoute from "~/features/dashboard/layout/route";
import { loadDashboardLayoutData } from "~/features/dashboard/layout/server";
import { runLoaderWithErrorHandling } from "~/shared/errors/route-error-handling.server";

export async function loader({ context, request }: Route.LoaderArgs) {
  return runLoaderWithErrorHandling({
    context,
    handler: () => loadDashboardLayoutData(request, context),
    request,
    routeId: APP_ROUTE_ID.dashboardLayout,
  });
}

export default DashboardLayoutRoute;
