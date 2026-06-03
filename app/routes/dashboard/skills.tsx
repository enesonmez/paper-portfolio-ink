import type { Route } from "./+types/skills";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
  APP_ROUTE_ID,
} from "~/shared/errors/contracts";

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
import { assertSameOriginMutationRequest } from "~/shared/security/csrf.server";

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
    handler: () => {
      assertSameOriginMutationRequest({
        action: APP_ERROR_ACTION.mutate,
        code: APP_ERROR_CODE.security.csrf.invalidOrigin,
        request,
        resource: APP_ERROR_RESOURCE.skills,
      });

      return handleDashboardSkillsAction(context, request);
    },
    request,
    routeId: APP_ROUTE_ID.dashboardSkills,
  });
}

export { DashboardSkillsAccessDeniedScreen, DashboardSkillsScreen };

export default DashboardSkillsRoute;
