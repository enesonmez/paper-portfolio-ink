import type { Route } from "./+types/api-auth";

import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
  APP_ROUTE_ID,
} from "~/shared/errors/contracts";
import { runActionWithErrorHandling } from "~/shared/errors/route-error-handling.server";
import { resolveAuthConfig } from "~/shared/auth/auth-config.server";
import { createAuth } from "~/shared/auth/auth.server";
import { assertSameOriginMutationRequest } from "~/shared/security/csrf.server";

function getAuthFromContext(request: Request, context: Route.LoaderArgs["context"]) {
  const authConfig = resolveAuthConfig(request, context.auth);

  return createAuth({
    db: context.db,
    ...authConfig,
  });
}

export function loader({ context, request }: Route.LoaderArgs) {
  return getAuthFromContext(request, context).handler(request);
}

export function action({ context, request }: Route.ActionArgs) {
  return runActionWithErrorHandling({
    context,
    handler: () => {
      assertSameOriginMutationRequest({
        action: APP_ERROR_ACTION.manage,
        code: APP_ERROR_CODE.security.csrf.invalidOrigin,
        request,
        resource: APP_ERROR_RESOURCE.authApi,
      });

      return getAuthFromContext(request, context).handler(request);
    },
    request,
    routeId: APP_ROUTE_ID.authApi,
  });
}
