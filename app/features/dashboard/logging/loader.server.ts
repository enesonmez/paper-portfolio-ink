import type { AppLoadContext } from "react-router";

import { loadDashboardLoggingOverview } from "~/lib/logging/logs.server";
import {
  actorHasClaim,
  assertClaimAuthorized,
  withDashboardAccess,
} from "~/shared/authz/authz.server";
import { AUTHORIZATION_CLAIM } from "~/shared/authz/model";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";

import {
  buildDeniedLoaderData,
  buildGrantedLoggingLoaderData,
  normalizeLoggingTab,
  type DashboardLoggingLoaderData,
} from "./state";

export async function loadDashboardLoggingData(
  context: AppLoadContext,
  request: Request,
): Promise<DashboardLoggingLoaderData | Response> {
  return withDashboardAccess({
    request,
    context,
    authorize: ({ actor }) =>
      assertClaimAuthorized({
        actor,
        claim: AUTHORIZATION_CLAIM.logsRead,
        error: {
          action: APP_ERROR_ACTION.read,
          code: APP_ERROR_CODE.logging.read.forbidden,
          message: "Logging dashboard access denied",
          resource: APP_ERROR_RESOURCE.logs,
          responseData: buildDeniedLoaderData(),
          status: 403,
        },
      }),
    handle: async ({ actor }) => {
      const url = new URL(request.url);
      const selectedTab = normalizeLoggingTab(url.searchParams.get("tab"));
      const { errorEntries, historyEntries, totals } =
        await loadDashboardLoggingOverview(context);

      return buildGrantedLoggingLoaderData({
        errorEntries,
        historyEntries,
        permissions: {
          canDelete: actorHasClaim(actor, AUTHORIZATION_CLAIM.logsDelete),
          canExport: actorHasClaim(actor, AUTHORIZATION_CLAIM.logsExport),
        },
        selectedTab,
        totals: {
          errors: totals.errorCount,
          history: totals.historyCount,
        },
      });
    },
  });
}
