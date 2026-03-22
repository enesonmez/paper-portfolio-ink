import type { Route } from "./+types/dashboard.resources";

import DashboardResourcesRoute, {
  DashboardResourcesAccessDeniedScreen,
  DashboardResourcesScreen,
} from "~/features/dashboard/resources/route";
import {
  handleDashboardResourcesAction,
  loadDashboardResourcesData,
} from "~/features/dashboard/resources/server";

export async function loader({ context, request }: Route.LoaderArgs) {
  return loadDashboardResourcesData(context, request);
}

export async function action({ context, request }: Route.ActionArgs) {
  return handleDashboardResourcesAction(context, request);
}

export { DashboardResourcesAccessDeniedScreen, DashboardResourcesScreen };

export default DashboardResourcesRoute;
