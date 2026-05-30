import { redirect, type AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../../db/context";
import { deleteOtherSessions } from "~/lib/configuration/sessions.server";
import { getSessionForRequest } from "~/shared/auth/session.server";
import type { AuthorizationActor } from "~/shared/authz/actor";
import { APP_ERROR_ACTION, APP_ERROR_RESOURCE } from "~/shared/errors/contracts";
import { buildLocalizedPath, type createTranslator } from "~/shared/i18n/i18n.shared";
import { recordAuditLog } from "~/shared/logging/audit.server";

import { buildDashboardSettingsHref } from "../state";

export async function handleRevokeOtherSessionsMutation(args: {
  actor: AuthorizationActor;
  context: AppLoadContext;
  intent: string;
  locale: string;
  request: Request;
  supportedLocaleCodes: readonly string[];
  t: ReturnType<typeof createTranslator>;
}) {
  const db = getDbFromContext(args.context);
  const sessionData = await getSessionForRequest(args.request, args.context);
  const currentToken = sessionData?.session?.token ?? "";
  const userId = args.actor.userId;

  if (userId) {
    await deleteOtherSessions(db, userId, currentToken);

    await recordAuditLog({
      action: APP_ERROR_ACTION.delete,
      context: args.context,
      details: {
        intent: args.intent,
        userId,
      },
      message: "Other active sessions revoked",
      request: args.request,
      resource: APP_ERROR_RESOURCE.settings,
      result: "success",
      statusCode: 302,
      targetId: userId,
      targetLabel: "Session",
    });
  }

  return redirect(
    buildLocalizedPath(
      args.locale,
      buildDashboardSettingsHref("security"),
      args.supportedLocaleCodes,
    ),
  );
}
