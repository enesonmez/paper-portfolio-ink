import type { AppLoadContext } from "react-router";

import { buildLoginRedirect } from "~/lib/auth/login.server";
import { requireSession } from "~/lib/auth/session.server";

import {
  buildDashboardIdentity,
  type DashboardIdentity,
} from "./dashboard-layout.shared";

export interface DashboardLayoutLoaderData {
  user: DashboardIdentity;
}

export async function loadDashboardLayoutData(
  request: Request,
  context: AppLoadContext,
): Promise<DashboardLayoutLoaderData | Response> {
  const session = await requireSession(request, context, {
    redirectTo: await buildLoginRedirect(context, request),
  });

  if (session instanceof Response) {
    return session;
  }

  return {
    user: buildDashboardIdentity(session.user as Record<string, unknown>),
  };
}
