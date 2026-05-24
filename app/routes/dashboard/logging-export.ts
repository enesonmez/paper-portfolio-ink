import type { AppLoadContext } from "react-router";

import { APP_ROUTE_ID } from "~/shared/errors/contracts";
import { runLoaderWithErrorHandling } from "~/shared/errors/route-error-handling.server";
import { loadDashboardLoggingExportFile } from "~/features/dashboard/logging/server";

export async function loader({
  context,
  request,
}: {
  context: AppLoadContext;
  request: Request;
}) {
  return runLoaderWithErrorHandling({
    context,
    handler: () => loadDashboardLoggingExportFile(context, request),
    request,
    routeId: APP_ROUTE_ID.dashboardLogging,
  });
}
