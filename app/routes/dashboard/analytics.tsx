import type { Route } from "./+types/analytics";
import { APP_ROUTE_ID } from "~/shared/errors/contracts";

import DashboardAnalyticsRoute, {
  DashboardAnalyticsAccessDeniedScreen,
  DashboardAnalyticsScreen,
} from "~/features/dashboard/analytics/route";
import { runLoaderWithErrorHandling } from "~/shared/errors/route-error-handling.server";
import { loadDashboardAnalyticsData } from "~/features/dashboard/analytics/server";

export async function loader({ context, request }: Route.LoaderArgs) {
  return runLoaderWithErrorHandling({
    context,
    handler: () => loadDashboardAnalyticsData(context, request),
    request,
    routeId: APP_ROUTE_ID.dashboardAnalytics,
  });
}

export { DashboardAnalyticsAccessDeniedScreen, DashboardAnalyticsScreen };

export default DashboardAnalyticsRoute;
