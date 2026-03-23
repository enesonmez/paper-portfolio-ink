import type { Route } from "./+types/login";
import { APP_ROUTE_ID } from "~/shared/errors/contracts";

import { buildLoginMeta } from "~/features/auth/login/copy";
import type { loader as rootLoader } from "~/root";
import {
  runActionWithErrorHandling,
  runLoaderWithErrorHandling,
} from "~/shared/errors/route-error-handling.server";
import { createTranslator } from "~/shared/i18n/i18n.shared";
import LoginRoute, { LoginScreen } from "~/features/auth/login/route";
import { handleLoginAction, loadLoginData } from "~/features/auth/login/server";

type RootLoaderData = Exclude<Awaited<ReturnType<typeof rootLoader>>, Response>;

export function meta({ matches }: Route.MetaArgs) {
  for (const match of matches) {
    if (match && match.id === "root" && !(match.data instanceof Response)) {
      const rootData = match.data as RootLoaderData;
      return [...buildLoginMeta(createTranslator(rootData.messages))];
    }
  }

  return [];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  return runLoaderWithErrorHandling({
    context,
    handler: () => loadLoginData(request, context),
    request,
    routeId: APP_ROUTE_ID.authLogin,
  });
}

export async function action({ context, request }: Route.ActionArgs) {
  return runActionWithErrorHandling({
    context,
    handler: () => handleLoginAction(request, context),
    request,
    routeId: APP_ROUTE_ID.authLogin,
  });
}

export { LoginScreen };

export default LoginRoute;
