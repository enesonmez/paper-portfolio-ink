import type { Route } from "./+types/translations";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
  APP_ROUTE_ID,
} from "~/shared/errors/contracts";

import { runActionWithErrorHandling } from "~/shared/errors/route-error-handling.server";
import { handleDashboardResourcesAction } from "~/features/dashboard/resources/server";
import { assertSameOriginMutationRequest } from "~/shared/security/csrf.server";

export async function action({ context, request }: Route.ActionArgs) {
  return runActionWithErrorHandling({
    context,
    handler: () => {
      assertSameOriginMutationRequest({
        action: APP_ERROR_ACTION.mutate,
        code: APP_ERROR_CODE.security.csrf.invalidOrigin,
        request,
        resource: APP_ERROR_RESOURCE.resourcesTranslations,
      });

      return handleDashboardResourcesAction(context, request);
    },
    request,
    routeId: APP_ROUTE_ID.dashboardResourcesTranslations,
  });
}

export { default } from "~/features/dashboard/resources/translations/screen";
