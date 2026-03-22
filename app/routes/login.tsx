import type { Route } from "./+types/login";

import { buildLoginMeta } from "~/features/auth/login/copy";
import type { loader as rootLoader } from "~/root";
import { createTranslator } from "~/shared/i18n/i18n.shared";
import LoginRoute, { LoginScreen } from "~/features/auth/login/route";
import { handleLoginAction, loadLoginData } from "~/features/auth/login/server";

export function meta({ matches }: Route.MetaArgs) {
  for (const match of matches) {
    if (match && match.id === "root") {
      const rootData = match.data as Awaited<ReturnType<typeof rootLoader>>;
      return [...buildLoginMeta(createTranslator(rootData.messages))];
    }
  }

  return [];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  return loadLoginData(request, context);
}

export async function action({ context, request }: Route.ActionArgs) {
  return handleLoginAction(request, context);
}

export { LoginScreen };

export default LoginRoute;
