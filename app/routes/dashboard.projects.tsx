import type { Route } from "./+types/dashboard.projects";

import DashboardProjectsRoute, {
  DashboardProjectsScreen,
} from "~/features/dashboard/projects/dashboard-projects-route";
import {
  handleDashboardProjectsAction,
  loadDashboardProjectsData,
} from "~/features/dashboard/projects/dashboard-projects.server";

export async function loader({ context, request }: Route.LoaderArgs) {
  return loadDashboardProjectsData(context, request);
}

export async function action({ context, request }: Route.ActionArgs) {
  return handleDashboardProjectsAction(context, request);
}

export { DashboardProjectsScreen };

export default DashboardProjectsRoute;
