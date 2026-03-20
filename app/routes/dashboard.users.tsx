import type { Route } from "./+types/dashboard.users";

import DashboardUsersRoute, {
  DashboardUsersAccessDeniedScreen,
  DashboardUsersScreen,
} from "~/features/dashboard/users/dashboard-users-route";
import {
  handleDashboardUsersAction,
  loadDashboardUsersData,
} from "~/features/dashboard/users/dashboard-users.server";

export async function loader({ context, request }: Route.LoaderArgs) {
  return loadDashboardUsersData(context, request);
}

export async function action({ context, request }: Route.ActionArgs) {
  return handleDashboardUsersAction(context, request);
}

export { DashboardUsersAccessDeniedScreen, DashboardUsersScreen };

export default DashboardUsersRoute;
