import type { Route } from "./+types/logout";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
  APP_ROUTE_ID,
} from "~/shared/errors/contracts";

import {
  runActionWithErrorHandling,
  runLoaderWithErrorHandling,
} from "~/shared/errors/route-error-handling.server";
import {
  performLogout,
  redirectLoggedOutUsers,
} from "~/features/auth/logout/logout.server";
import { assertSameOriginMutationRequest } from "~/shared/security/csrf.server";

export function loader({ context, request }: Route.LoaderArgs) {
  return runLoaderWithErrorHandling({
    context,
    handler: () => Promise.resolve(redirectLoggedOutUsers(context, request)),
    request,
    routeId: APP_ROUTE_ID.authLogout,
  });
}

export function action({ context, request }: Route.ActionArgs) {
  return runActionWithErrorHandling({
    context,
    handler: () => {
      assertSameOriginMutationRequest({
        action: APP_ERROR_ACTION.manage,
        code: APP_ERROR_CODE.security.csrf.invalidOrigin,
        request,
        resource: APP_ERROR_RESOURCE.authLogout,
      });

      return Promise.resolve(
        performLogout({
          context,
          request,
        }),
      );
    },
    request,
    routeId: APP_ROUTE_ID.authLogout,
  });
}

export default function LogoutRoute() {
  return null;
}
