import type { Route } from "./+types/skills";
import { APP_ROUTE_ID } from "~/shared/errors/contracts";

import DashboardSkillsRoute, {
  DashboardSkillsAccessDeniedScreen,
  DashboardSkillsScreen,
} from "~/features/dashboard/skills/route";
import {
  runActionWithErrorHandling,
  runLoaderWithErrorHandling,
} from "~/shared/errors/route-error-handling.server";
import {
  handleDashboardSkillsAction,
  loadDashboardSkillsData,
} from "~/features/dashboard/skills/server";

export async function loader({ context, request }: Route.LoaderArgs) {
  return runLoaderWithErrorHandling({
    context,
    handler: () => loadDashboardSkillsData(context, request),
    request,
    routeId: APP_ROUTE_ID.dashboardSkills,
  });
}

export async function action({ context, request }: Route.ActionArgs) {
  return runActionWithErrorHandling({
    context,
    handler: () => handleDashboardSkillsAction(context, request),
    request,
    routeId: APP_ROUTE_ID.dashboardSkills,
  });
}

export { DashboardSkillsAccessDeniedScreen, DashboardSkillsScreen };

export default DashboardSkillsRoute;
