import { redirect, type AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../../db/context";
import { deleteSession, getSessionById } from "~/lib/configuration/sessions.server";
import type { AuthorizationActor } from "~/shared/authz/actor";
import { actorHasClaim } from "~/shared/authz/authz.server";
import { AUTHORIZATION_CLAIM } from "~/shared/authz/model";
import {
  buildValidationError,
  buildAuthorizationError,
} from "~/shared/errors/builders.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";
import { readStringField } from "~/shared/forms/form-data.server";
import { buildLocalizedPath, type createTranslator } from "~/shared/i18n/i18n.shared";
import { recordAuditLog } from "~/shared/logging/audit.server";

import { buildDashboardSettingsHref } from "../state";

export async function handleRevokeSessionMutation(args: {
  actor: AuthorizationActor;
  context: AppLoadContext;
  formData: FormData;
  intent: string;
  locale: string;
  request: Request;
  supportedLocaleCodes: readonly string[];
  t: ReturnType<typeof createTranslator>;
}) {
  const db = getDbFromContext(args.context);
  const sessionId = readStringField(args.formData, "sessionId");

  if (!sessionId) {
    throw buildValidationError({
      action: APP_ERROR_ACTION.delete,
      code: APP_ERROR_CODE.settings.mutation.invalidIntent,
      message: "Missing sessionId for revoke action",
      resource: APP_ERROR_RESOURCE.settings,
      status: 400,
    });
  }

  const session = await getSessionById(db, sessionId);
  if (!session) {
    throw buildValidationError({
      action: APP_ERROR_ACTION.delete,
      code: APP_ERROR_CODE.settings.mutation.invalidIntent,
      message: "Session not found",
      resource: APP_ERROR_RESOURCE.settings,
      status: 404,
    });
  }

  const hasSettingsSecurityManageAny = actorHasClaim(
    args.actor,
    AUTHORIZATION_CLAIM.settingsSecurityManageAny,
  );

  if (!hasSettingsSecurityManageAny && session.userId !== args.actor.userId) {
    throw buildAuthorizationError({
      action: APP_ERROR_ACTION.delete,
      code: APP_ERROR_CODE.settings.delete.forbidden,
      message: "Unauthorized to revoke this session",
      resource: APP_ERROR_RESOURCE.settings,
      status: 403,
    });
  }

  await deleteSession(db, sessionId);

  await recordAuditLog({
    action: APP_ERROR_ACTION.delete,
    context: args.context,
    details: {
      intent: args.intent,
      sessionId,
    },
    message: "Active session revoked",
    request: args.request,
    resource: APP_ERROR_RESOURCE.settings,
    result: "success",
    statusCode: 302,
    targetId: sessionId,
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
