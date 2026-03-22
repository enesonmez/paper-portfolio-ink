import type { AppLoadContext } from "react-router";

import { requireDashboardActor } from "~/shared/authz/authz.server";

import { buildDashboardIdentity, type DashboardIdentity } from "./identity";

export interface DashboardLayoutLoaderData {
  user: DashboardIdentity;
}

export async function loadDashboardLayoutData(
  request: Request,
  context: AppLoadContext,
): Promise<DashboardLayoutLoaderData | Response> {
  const auth = await requireDashboardActor(context, request);

  if (auth instanceof Response) {
    return auth;
  }

  return {
    user: buildDashboardIdentity({
      ...auth.sessionUser,
      claims: auth.actor.claims,
    }),
  };
}
