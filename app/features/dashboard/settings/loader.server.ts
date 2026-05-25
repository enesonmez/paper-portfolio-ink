import type { AppLoadContext } from "react-router";

import {
  actorHasClaim,
  assertAuthorized,
  withDashboardAccess,
} from "~/shared/authz/authz.server";
import { AUTHORIZATION_CLAIM } from "~/shared/authz/model";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";

import {
  buildDeniedDashboardSettingsLoaderData,
  normalizeDashboardSettingsTab,
  type DashboardSettingsLoaderData,
} from "./state";

export async function loadDashboardSettingsData(
  context: AppLoadContext,
  request: Request,
): Promise<DashboardSettingsLoaderData | Response> {
  return withDashboardAccess({
    request,
    context,
    authorize: ({ actor }) =>
      assertAuthorized<DashboardSettingsLoaderData>({
        error: {
          action: APP_ERROR_ACTION.read,
          code: APP_ERROR_CODE.settings.read.forbidden,
          message: "Dashboard settings access denied",
          resource: APP_ERROR_RESOURCE.settings,
          responseData: buildDeniedDashboardSettingsLoaderData(),
          status: 403,
        },
        isAllowed: actorHasClaim(actor, AUTHORIZATION_CLAIM.settingsManage),
      }),
    handle: () => {
      const url = new URL(request.url);

      return {
        access: "granted",
        selectedTab: normalizeDashboardSettingsTab(url.searchParams.get("tab")),
      };
    },
  });
}
