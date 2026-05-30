import { redirect, type AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../../db/context";
import { deleteAllOtherSessions } from "~/lib/configuration/sessions.server";
import { getSessionForRequest } from "~/shared/auth/session.server";
import type { AuthorizationActor } from "~/shared/authz/actor";
import { actorHasClaim } from "~/shared/authz/guards";
import { AUTHORIZATION_CLAIM } from "~/shared/authz/model";
import { buildAuthorizationError } from "~/shared/errors/builders.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";
import { buildLocalizedPath, type createTranslator } from "~/shared/i18n/i18n.shared";
import { recordAuditLog } from "~/shared/logging/audit.server";

import { buildDashboardSettingsHref } from "../state";

export async function handleRevokeAllSessionsMutation(args: {
  actor: AuthorizationActor;
  context: AppLoadContext;
  intent: string;
  locale: string;
  request: Request;
  supportedLocaleCodes: readonly string[];
  t: ReturnType<typeof createTranslator>;
}) {
  if (!actorHasClaim(args.actor, AUTHORIZATION_CLAIM.settingsSecurityManageAny)) {
    throw buildAuthorizationError({
      action: APP_ERROR_ACTION.delete,
      code: APP_ERROR_CODE.settings.delete.forbidden,
      message: "Revoke all sessions requires settings.security.manage.any claim",
      resource: APP_ERROR_RESOURCE.settings,
      status: 403,
    });
  }

  const db = getDbFromContext(args.context);
  const sessionData = await getSessionForRequest(args.request, args.context);
  const currentToken = sessionData?.session?.token ?? "";

  await deleteAllOtherSessions(db, currentToken);

  await recordAuditLog({
    action: APP_ERROR_ACTION.delete,
    context: args.context,
    details: {
      intent: args.intent,
      scope: "all",
    },
    message: "All active sessions revoked (except current)",
    request: args.request,
    resource: APP_ERROR_RESOURCE.settings,
    result: "success",
    statusCode: 302,
    targetId: args.actor.userId,
    targetLabel: "Session",
  });

  return redirect(
    buildLocalizedPath(
      args.locale,
      buildDashboardSettingsHref("security"),
      args.supportedLocaleCodes,
    ),
  );
}
