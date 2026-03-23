import type { AppLoadContext } from "react-router";

import { insertLogHistoryEntry } from "~/lib/logging/logs.server";
import { getSessionForRequest } from "~/shared/auth/session.server";
import { getSessionUserId, getSessionUserRole } from "~/shared/auth/session-user";
import { isUserRole } from "~/shared/authz/model";
import { getRequestId } from "~/shared/errors/request-id.server";

function sanitizeAuditMetadata(details?: Record<string, unknown>) {
  return JSON.stringify(details ?? {});
}

async function resolveAuditActor(request: Request, context: AppLoadContext) {
  try {
    const session = await getSessionForRequest(request, context);
    const role = getSessionUserRole(session);

    return {
      userId: getSessionUserId(session),
      userRole: role && isUserRole(role) ? role : null,
    };
  } catch {
    return {
      userId: null,
      userRole: null,
    };
  }
}

export async function recordAuditLog(args: {
  action: string;
  context: AppLoadContext;
  details?: Record<string, unknown>;
  message: string;
  request: Request;
  resource: string;
  result: "failure" | "success";
  statusCode: number;
  targetId?: string | null;
  targetLabel?: string | null;
}) {
  const actor = await resolveAuditActor(args.request, args.context);

  await insertLogHistoryEntry(args.context, {
    action: args.action,
    message: args.message,
    metadataJson: sanitizeAuditMetadata(args.details),
    method: args.request.method,
    path: new URL(args.request.url).pathname,
    requestId: getRequestId(args.request),
    resource: args.resource,
    result: args.result,
    statusCode: args.statusCode,
    targetId: args.targetId ?? null,
    targetLabel: args.targetLabel ?? null,
    userId: actor.userId,
    userRole: actor.userRole,
  });
}
