import { Outlet } from "react-router";

import type { Route } from "./+types/dashboard";
import { buildLoginRedirect } from "../lib/auth/login.server";
import { requireSession } from "../lib/auth/session.server";

export async function loader({ context, request }: Route.LoaderArgs) {
  const session = await requireSession(request, context, {
    redirectTo: buildLoginRedirect(request),
  });

  if (session instanceof Response) {
    return session;
  }

  return null;
}

export default function DashboardLayout() {
  return <Outlet />;
}
