import type { Route } from "./+types/login";

import { LOGIN_META } from "~/features/auth/login/login.constants";
import LoginRoute, { LoginScreen } from "~/features/auth/login/login-route";
import { handleLoginAction, loadLoginData } from "~/features/auth/login/login.server";

export function meta() {
  return [...LOGIN_META];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  return loadLoginData(request, context);
}

export async function action({ context, request }: Route.ActionArgs) {
  return handleLoginAction(request, context);
}

export { LoginScreen };

export default LoginRoute;
