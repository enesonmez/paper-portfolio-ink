import type { Route } from "./+types/logout";
import { APP_ROUTE_ID } from "~/shared/errors/contracts";

import {
  runActionWithErrorHandling,
  runLoaderWithErrorHandling,
} from "~/shared/errors/route-error-handling.server";
import {
  performLogout,
  redirectLoggedOutUsers,
} from "~/features/auth/logout/logout.server";

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
    handler: () =>
      Promise.resolve(
        performLogout({
          context,
          request,
        }),
      ),
    request,
    routeId: APP_ROUTE_ID.authLogout,
  });
}

export default function LogoutRoute() {
  return null;
}
