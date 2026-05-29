import type { Route } from "./+types/index";
import { useLoaderData } from "react-router";
import { APP_ROUTE_ID } from "~/shared/errors/contracts";
import { loadDashboardOverviewData } from "~/features/dashboard/overview/loader.server";
import { runLoaderWithErrorHandling } from "~/shared/errors/route-error-handling.server";
import DashboardOverviewScreen from "~/features/dashboard/overview/screen";

export async function loader({ context, request }: Route.LoaderArgs) {
  return runLoaderWithErrorHandling({
    context,
    handler: () => loadDashboardOverviewData(context, request),
    request,
    routeId: APP_ROUTE_ID.dashboardIndex,
  });
}

export default function DashboardOverviewRoute() {
  const loaderData = useLoaderData<typeof loadDashboardOverviewData>();

  const defaultData = {
    stats: {
      postCount: 0,
      projectCount: 0,
      activeUserCount: 0,
      skillCount: 0,
    },
    recentLogs: [],
    recentPosts: [],
    analytics: {
      enabled: false,
      dailyViews: [],
      monthlyViews: [],
    },
  };

  const data = loaderData || defaultData;

  return <DashboardOverviewScreen {...data} />;
}
