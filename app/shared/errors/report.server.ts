import type { AppLoadContext } from "react-router";

import {
  insertLogErrorHistoryEntry,
  insertLogHistoryEntry,
} from "~/lib/logging/logs.server";
import { getSessionForRequest } from "~/shared/auth/session.server";
import { getSessionUserId, getSessionUserRole } from "~/shared/auth/session-user";
import { isUserRole } from "~/shared/authz/model";

import {
  APP_ERROR_SINK,
  isAppErrorReported,
  markAppErrorReported,
  type AppError,
} from "./app-error.server";
import type { AppRouteId } from "./contracts";
import { getRequestId } from "./request-id.server";

function sanitizeMetadata(details: Record<string, unknown>) {
  return JSON.stringify(details);
}

function buildErrorFingerprint(error: AppError, path: string) {
  return [error.code, error.status, path].join(":");
}

function extractRequestLocale(request: Request) {
  const [, localeSegment] = new URL(request.url).pathname.split("/");

  return localeSegment && localeSegment.length > 0 ? localeSegment : null;
}

async function resolveRequestActor(request: Request, context: AppLoadContext) {
  try {
    const session = await getSessionForRequest(request, context);
    const userRole = getSessionUserRole(session);

    return {
      userId: getSessionUserId(session),
      userRole: userRole && isUserRole(userRole) ? userRole : null,
    };
  } catch {
    return {
      userId: null,
      userRole: null,
    };
  }
}

export async function reportAppError(args: {
  context: AppLoadContext;
  error: AppError;
  request: Request;
  routeId?: AppRouteId;
}) {
  if (isAppErrorReported(args.error)) {
    return args.error;
  }

  const requestId = getRequestId(args.request);
  const { pathname } = new URL(args.request.url);
  const actor = await resolveRequestActor(args.request, args.context);

  args.error.requestId = requestId;

  if (
    args.error.logSink === APP_ERROR_SINK.logHistory ||
    args.error.logSink === APP_ERROR_SINK.both
  ) {
    await insertLogHistoryEntry(args.context, {
      action: args.error.audit?.action ?? args.error.code,
      message: args.error.audit?.message ?? args.error.message,
      metadataJson: sanitizeMetadata(args.error.details),
      method: args.request.method,
      path: pathname,
      requestId,
      resource: args.error.audit?.resource ?? args.error.category,
      result: args.error.audit?.result ?? "failure",
      statusCode: args.error.status,
      targetId: args.error.audit?.targetId ?? null,
      targetLabel: args.error.audit?.targetLabel ?? null,
      userId: actor.userId,
      userRole: actor.userRole,
    });
  }

  if (
    args.error.logSink === APP_ERROR_SINK.logErrorHistory ||
    args.error.logSink === APP_ERROR_SINK.both
  ) {
    await insertLogErrorHistoryEntry(args.context, {
      category: args.error.category,
      code: args.error.code,
      fingerprint: buildErrorFingerprint(args.error, pathname),
      locale: extractRequestLocale(args.request),
      message: args.error.message,
      metadataJson: sanitizeMetadata(args.error.details),
      method: args.request.method,
      path: pathname,
      requestId,
      routeId: args.routeId ?? null,
      severity: args.error.severity,
      stack: args.error.stack ?? null,
      statusCode: args.error.status,
      userId: actor.userId,
      userRole: actor.userRole,
    });
  }

  return markAppErrorReported(args.error);
}
