import type { Route } from "./+types/layout";

import DashboardResourcesRoute, {
  DashboardResourcesAccessDeniedScreen,
} from "~/features/dashboard/resources/layout/route";
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

export { DashboardResourcesAccessDeniedScreen };

export default DashboardResourcesRoute;
