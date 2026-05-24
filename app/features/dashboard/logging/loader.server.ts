import type { AppLoadContext } from "react-router";

import { loadDashboardLoggingOverview } from "~/lib/logging/logs.server";
import {
  LOGGING_QUERY_PARAM,
  normalizeLoggingPaginationDirection,
  parseLoggingCursor,
} from "~/domain/logging/model";
import {
  actorHasClaim,
  assertAnyClaimAuthorized,
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
  resolveAccessibleLoggingTab,
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
      assertAnyClaimAuthorized({
        actor,
        claims: [AUTHORIZATION_CLAIM.logsAuditRead, AUTHORIZATION_CLAIM.logsErrorRead],
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
      const requestedTab = normalizeLoggingTab(
        url.searchParams.get(LOGGING_QUERY_PARAM.tab),
      );
      const canReadHistory = actorHasClaim(actor, AUTHORIZATION_CLAIM.logsAuditRead);
      const canReadErrors = actorHasClaim(actor, AUTHORIZATION_CLAIM.logsErrorRead);
      const selectedTab = resolveAccessibleLoggingTab({
        canReadErrors,
        canReadHistory,
        requestedTab,
      });
      const cursor = parseLoggingCursor(
        url.searchParams.get(LOGGING_QUERY_PARAM.cursor),
      );
      const direction = normalizeLoggingPaginationDirection(
        url.searchParams.get(LOGGING_QUERY_PARAM.direction),
      );
      const { errorPage, historyPage, totals } = await loadDashboardLoggingOverview(
        context,
        {
          errorPage:
            canReadErrors && selectedTab === "errors"
              ? {
                  cursor,
                  direction,
                }
              : undefined,
          historyPage:
            canReadHistory && selectedTab === "history"
              ? {
                  cursor,
                  direction,
                }
              : undefined,
          includeErrorTotals: canReadErrors,
          includeHistoryTotals: canReadHistory,
        },
      );

      return buildGrantedLoggingLoaderData({
        errorPage,
        historyPage,
        permissions: {
          canDeleteErrors: actorHasClaim(actor, AUTHORIZATION_CLAIM.logsErrorDelete),
          canDeleteHistory: actorHasClaim(actor, AUTHORIZATION_CLAIM.logsAuditDelete),
          canExportErrors: actorHasClaim(actor, AUTHORIZATION_CLAIM.logsErrorExport),
          canExportHistory: actorHasClaim(actor, AUTHORIZATION_CLAIM.logsAuditExport),
          canReadErrors,
          canReadHistory,
        },
        selectedTab,
        totals: {
          errors: canReadErrors ? totals.errorCount : 0,
          history: canReadHistory ? totals.historyCount : 0,
        },
      });
    },
  });
}
