import type { AppLoadContext } from "react-router";
import { getDbFromContext } from "../../../../db/context";
import {
  actorHasClaim,
  assertAnyClaimAuthorized,
  withDashboardAccess,
} from "~/shared/authz/authz.server";
import {
  AUTHORIZATION_CLAIM,
  SETTINGS_AUTHORIZATION_CLAIMS,
  type AuthorizationClaim,
} from "~/shared/authz/model";
import { buildAuthorizationError } from "~/shared/errors/builders.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";
import { loadAccountConfigurationParameters } from "~/lib/configuration/configuration.server";
import { listActiveSessions } from "~/lib/configuration/sessions.server";
import { getSessionForRequest } from "~/shared/auth/session.server";

import {
  buildDeniedDashboardSettingsLoaderData,
  DASHBOARD_SETTINGS_QUERY_PARAM,
  DASHBOARD_SETTINGS_TAB,
  normalizeDashboardSettingsTab,
  resolveDashboardSettingsAccountForm,
  type DashboardSettingsLoaderData,
  type DashboardSettingsSecuritySession,
  type DashboardSettingsTab,
} from "./state";

const TAB_REQUIRED_CLAIM: Record<DashboardSettingsTab, AuthorizationClaim> = {
  account: AUTHORIZATION_CLAIM.settingsAccountManage,
  appearance: AUTHORIZATION_CLAIM.settingsAppearanceManage,
  security: AUTHORIZATION_CLAIM.settingsSecurityManageOwn,
  runtime: AUTHORIZATION_CLAIM.settingsRuntimeManage,
};

export async function loadDashboardSettingsData(
  context: AppLoadContext,
  request: Request,
): Promise<DashboardSettingsLoaderData | Response> {
  return withDashboardAccess({
    request,
    context,
    authorize: ({ actor }) =>
      assertAnyClaimAuthorized<DashboardSettingsLoaderData>({
        actor,
        claims: SETTINGS_AUTHORIZATION_CLAIMS,
        error: {
          action: APP_ERROR_ACTION.read,
          code: APP_ERROR_CODE.settings.read.forbidden,
          message: "Dashboard settings access denied",
          resource: APP_ERROR_RESOURCE.settings,
          responseData: buildDeniedDashboardSettingsLoaderData(),
          status: 403,
        },
      }),
    handle: async ({ actor }) => {
      const url = new URL(request.url);
      const requestedTab = normalizeDashboardSettingsTab(
        url.searchParams.get(DASHBOARD_SETTINGS_QUERY_PARAM.tab),
      );

      const authorizedTabs = (
        Object.keys(TAB_REQUIRED_CLAIM) as DashboardSettingsTab[]
      ).filter((t) => {
        if (t === DASHBOARD_SETTINGS_TAB.security) {
          return (
            actorHasClaim(actor, AUTHORIZATION_CLAIM.settingsSecurityManageOwn) ||
            actorHasClaim(actor, AUTHORIZATION_CLAIM.settingsSecurityManageAny)
          );
        }
        return actorHasClaim(actor, TAB_REQUIRED_CLAIM[t]);
      });

      let activeTab = requestedTab;
      if (!authorizedTabs.includes(activeTab)) {
        if (authorizedTabs.length === 0) {
          throw buildAuthorizationError({
            action: APP_ERROR_ACTION.read,
            code: APP_ERROR_CODE.settings.read.forbidden,
            message: "Dashboard settings access denied",
            resource: APP_ERROR_RESOURCE.settings,
            status: 403,
          });
        }
        activeTab = authorizedTabs[0];
      }

      const accountValues = await loadAccountConfigurationParameters(context, request);

      const hasSettingsSecurityManageAny = actorHasClaim(
        actor,
        AUTHORIZATION_CLAIM.settingsSecurityManageAny,
      );

      let sessionsData: DashboardSettingsSecuritySession[] | undefined;
      if (activeTab === DASHBOARD_SETTINGS_TAB.security) {
        const db = getDbFromContext(context);
        const activeSessions = await listActiveSessions(
          db,
          hasSettingsSecurityManageAny ? undefined : actor.userId || undefined,
        );
        const sessionData = await getSessionForRequest(request, context);
        const currentToken = sessionData?.session?.token ?? "";

        sessionsData = activeSessions
          .map((s) => ({
            id: s.id,
            ipAddress: s.ipAddress,
            userAgent: s.userAgent,
            expiresAt: s.expiresAt.toISOString(),
            createdAt: s.createdAt.toISOString(),
            isCurrent: s.token === currentToken,
            user: {
              displayName: s.user.displayName,
              email: s.user.email,
              role: s.user.role,
            },
          }))
          .sort((a, b) => {
            if (a.isCurrent) return -1;
            if (b.isCurrent) return 1;
            return 0;
          });
      }

      return {
        access: "granted",
        accountForm: resolveDashboardSettingsAccountForm({
          accountValues,
          editKey: url.searchParams.get(DASHBOARD_SETTINGS_QUERY_PARAM.key),
          modal: url.searchParams.get(DASHBOARD_SETTINGS_QUERY_PARAM.modal),
        }),
        accountValues,
        selectedTab: activeTab,
        authorizedTabs,
        hasSettingsSecurityManageAny,
        sessions: sessionsData,
      };
    },
  });
}
