import type { Route } from "./+types/dashboard";

import DashboardLayoutRoute from "~/features/dashboard/layout/dashboard-layout-route";
import { loadDashboardLayoutData } from "~/features/dashboard/layout/dashboard-layout.server";

export async function loader({ context, request }: Route.LoaderArgs) {
  return loadDashboardLayoutData(request, context);
}

export default DashboardLayoutRoute;
