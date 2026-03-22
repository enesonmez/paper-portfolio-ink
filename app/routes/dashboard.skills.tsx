import type { Route } from "./+types/dashboard.skills";

import DashboardSkillsRoute, {
  DashboardSkillsAccessDeniedScreen,
  DashboardSkillsScreen,
} from "~/features/dashboard/skills/route";
import {
  handleDashboardSkillsAction,
  loadDashboardSkillsData,
} from "~/features/dashboard/skills/server";

export async function loader({ context, request }: Route.LoaderArgs) {
  return loadDashboardSkillsData(context, request);
}

export async function action({ context, request }: Route.ActionArgs) {
  return handleDashboardSkillsAction(context, request);
}

export { DashboardSkillsAccessDeniedScreen, DashboardSkillsScreen };

export default DashboardSkillsRoute;
