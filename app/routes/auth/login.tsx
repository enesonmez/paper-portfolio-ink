import type { Route } from "./+types/login";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
  APP_ROUTE_ID,
} from "~/shared/errors/contracts";

import { buildLoginMeta } from "~/features/auth/login/copy";
import {
  runActionWithErrorHandling,
  runLoaderWithErrorHandling,
} from "~/shared/errors/route-error-handling.server";
import { createTranslator } from "~/shared/i18n/i18n.shared";
import LoginRoute, { LoginScreen } from "~/features/auth/login/route";
import { handleLoginAction, loadLoginData } from "~/features/auth/login/server";
import { getRootLoaderDataFromMatches } from "~/lib/site";
import { assertSameOriginMutationRequest } from "~/shared/security/csrf.server";

export function meta({ matches }: Route.MetaArgs) {
  const rootData = getRootLoaderDataFromMatches(matches);

  if (rootData) {
    return [
      ...buildLoginMeta(createTranslator(rootData.messages), rootData.configuration),
    ];
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
    handler: () => {
      assertSameOriginMutationRequest({
        action: APP_ERROR_ACTION.login,
        code: APP_ERROR_CODE.security.csrf.invalidOrigin,
        request,
        resource: APP_ERROR_RESOURCE.authLogin,
      });

      return handleLoginAction(request, context);
    },
    request,
    routeId: APP_ROUTE_ID.authLogin,
  });
}

export { LoginScreen };

export default LoginRoute;
