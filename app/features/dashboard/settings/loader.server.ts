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
import { loadAccountConfigurationParameters } from "~/lib/configuration/configuration.server";

import {
  buildDeniedDashboardSettingsLoaderData,
  DASHBOARD_SETTINGS_QUERY_PARAM,
  normalizeDashboardSettingsTab,
  resolveDashboardSettingsAccountForm,
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
    handle: async () => {
      const url = new URL(request.url);
      const accountValues = await loadAccountConfigurationParameters(context, request);

      return {
        access: "granted",
        accountForm: resolveDashboardSettingsAccountForm({
          accountValues,
          editKey: url.searchParams.get(DASHBOARD_SETTINGS_QUERY_PARAM.key),
          modal: url.searchParams.get(DASHBOARD_SETTINGS_QUERY_PARAM.modal),
        }),
        accountValues,
        selectedTab: normalizeDashboardSettingsTab(
          url.searchParams.get(DASHBOARD_SETTINGS_QUERY_PARAM.tab),
        ),
      };
    },
  });
}
