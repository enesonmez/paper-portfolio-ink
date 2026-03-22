import type { Route } from "./+types/logout";

import {
  performLogout,
  redirectLoggedOutUsers,
} from "~/features/auth/logout/logout.server";

export function loader({ context, request }: Route.LoaderArgs) {
  return redirectLoggedOutUsers(context, request);
}

export function action({ context, request }: Route.ActionArgs) {
  return performLogout({
    context,
    request,
  });
}

export default function LogoutRoute() {
  return null;
}
