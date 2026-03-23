import {
  APP_ERROR_SEVERITY,
  APP_ERROR_SINK,
  AuthorizationError,
  BusinessError,
  ConflictError,
  ValidationError,
} from "./app-error.server";
import type { AppErrorAction, AppErrorCode, AppErrorResource } from "./contracts";

interface ExpectedErrorBuilderOptions<TResponseData> {
  action: AppErrorAction;
  code: AppErrorCode;
  details?: Record<string, unknown>;
  message: string;
  resource: AppErrorResource;
  responseData?: TResponseData;
  status?: number;
  targetId?: string | null;
  targetLabel?: string | null;
}

export function buildValidationError<TResponseData>(
  options: ExpectedErrorBuilderOptions<TResponseData>,
) {
  return new ValidationError(options.message, {
    audit: {
      action: options.action,
      message: options.message,
      resource: options.resource,
      result: "failure",
      targetId: options.targetId,
      targetLabel: options.targetLabel,
    },
    code: options.code,
    details: options.details,
    expose: true,
    logSink: APP_ERROR_SINK.none,
    responseData: options.responseData,
    severity: APP_ERROR_SEVERITY.info,
    status: options.status ?? 400,
  });
}

export function buildAuthorizationError<TResponseData>(
  options: ExpectedErrorBuilderOptions<TResponseData>,
) {
  return new AuthorizationError(options.message, {
    audit: {
      action: options.action,
      message: options.message,
      resource: options.resource,
      result: "failure",
      targetId: options.targetId,
      targetLabel: options.targetLabel,
    },
    code: options.code,
    details: options.details,
    expose: true,
    logSink: APP_ERROR_SINK.logHistory,
    responseData: options.responseData,
    severity: APP_ERROR_SEVERITY.warn,
    status: options.status ?? 403,
  });
}

export function buildConflictError<TResponseData>(
  options: ExpectedErrorBuilderOptions<TResponseData>,
) {
  return new ConflictError(options.message, {
    audit: {
      action: options.action,
      message: options.message,
      resource: options.resource,
      result: "failure",
      targetId: options.targetId,
      targetLabel: options.targetLabel,
    },
    code: options.code,
    details: options.details,
    expose: true,
    logSink: APP_ERROR_SINK.logHistory,
    responseData: options.responseData,
    severity: APP_ERROR_SEVERITY.warn,
    status: options.status ?? 409,
  });
}

export function buildBusinessError<TResponseData>(
  options: ExpectedErrorBuilderOptions<TResponseData>,
) {
  return new BusinessError(options.message, {
    audit: {
      action: options.action,
      message: options.message,
      resource: options.resource,
      result: "failure",
      targetId: options.targetId,
      targetLabel: options.targetLabel,
    },
    code: options.code,
    details: options.details,
    expose: true,
    logSink: APP_ERROR_SINK.logHistory,
    responseData: options.responseData,
    severity: APP_ERROR_SEVERITY.warn,
    status: options.status ?? 400,
  });
}
