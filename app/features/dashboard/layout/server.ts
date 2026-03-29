import type { AppLoadContext } from "react-router";

import { withDashboardAccess } from "~/shared/authz/authz.server";

import { buildDashboardIdentity, type DashboardIdentity } from "./identity";

export interface DashboardLayoutLoaderData {
  user: DashboardIdentity;
}

export async function loadDashboardLayoutData(
  request: Request,
  context: AppLoadContext,
): Promise<DashboardLayoutLoaderData | Response> {
  return withDashboardAccess({
    context,
    handle: (auth) => ({
      user: buildDashboardIdentity({
        ...auth.sessionUser,
        claims: auth.actor.claims,
      }),
    }),
    request,
  });
}
