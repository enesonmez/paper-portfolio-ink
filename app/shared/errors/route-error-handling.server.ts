import { data, type AppLoadContext } from "react-router";

import { reportAppError } from "./report.server";
import { APP_ERROR_SINK, normalizeAppError, type AppError } from "./app-error.server";
import type { AppRouteId } from "./contracts";
import { buildRequestIdHeaders, getRequestId } from "./request-id.server";

function buildFallbackErrorPayload(error: AppError) {
  return {
    error: {
      code: error.code,
      message: error.expose ? error.message : "Unexpected application error.",
      requestId: error.requestId ?? null,
      status: error.status,
    },
  };
}

async function handleAppRouteError(args: {
  context: AppLoadContext;
  error: unknown;
  request: Request;
  routeId: AppRouteId;
}) {
  const normalizedError = normalizeAppError(args.error);
  const reportedError = await reportAppError({
    context: args.context,
    error: normalizedError,
    request: args.request,
    routeId: args.routeId,
  });
  const requestId = reportedError.requestId ?? getRequestId(args.request);

  if (reportedError.responseData !== undefined) {
    return data(reportedError.responseData, {
      headers: buildRequestIdHeaders(requestId),
      status: reportedError.status,
    });
  }

  if (
    reportedError.expose &&
    reportedError.logSink !== APP_ERROR_SINK.logErrorHistory
  ) {
    throw reportedError;
  }

  // React Router route modules intentionally throw `data(...)` payloads.
  // eslint-disable-next-line @typescript-eslint/only-throw-error
  throw data(buildFallbackErrorPayload(reportedError), {
    headers: buildRequestIdHeaders(requestId),
    status: reportedError.status,
  });
}

export async function runLoaderWithErrorHandling<T>(args: {
  context: AppLoadContext;
  handler: () => Promise<Response | T>;
  request: Request;
  routeId: AppRouteId;
}): Promise<Response | T> {
  try {
    return await args.handler();
  } catch (error) {
    return handleAppRouteError({
      context: args.context,
      error,
      request: args.request,
      routeId: args.routeId,
    }) as Promise<Response | T>;
  }
}

export async function runActionWithErrorHandling<T>(args: {
  context: AppLoadContext;
  handler: () => Promise<Response | T>;
  request: Request;
  routeId: AppRouteId;
}): Promise<Response | T> {
  try {
    return await args.handler();
  } catch (error) {
    return handleAppRouteError({
      context: args.context,
      error,
      request: args.request,
      routeId: args.routeId,
    }) as Promise<Response | T>;
  }
}
