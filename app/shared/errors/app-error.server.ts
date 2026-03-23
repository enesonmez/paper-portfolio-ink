import type { AppErrorAction, AppErrorCode, AppErrorResource } from "./contracts";
import { APP_ERROR_CODE } from "./contracts";

const APP_ERROR_REPORTED = Symbol("app.error.reported");

export const APP_ERROR_SEVERITY = {
  critical: "critical",
  error: "error",
  info: "info",
  warn: "warn",
} as const;

export type AppErrorSeverity =
  (typeof APP_ERROR_SEVERITY)[keyof typeof APP_ERROR_SEVERITY];

export const APP_ERROR_SINK = {
  both: "both",
  logErrorHistory: "log_error_history",
  logHistory: "log_history",
  none: "none",
} as const;

export type AppErrorSink = (typeof APP_ERROR_SINK)[keyof typeof APP_ERROR_SINK];

export const APP_ERROR_CATEGORY = {
  auth: "auth",
  authorization: "authorization",
  business: "business",
  external: "external",
  infrastructure: "infrastructure",
  internal: "internal",
  notFound: "not_found",
  validation: "validation",
} as const;

export type AppErrorCategory =
  (typeof APP_ERROR_CATEGORY)[keyof typeof APP_ERROR_CATEGORY];

export interface AppErrorAuditPayload {
  action: AppErrorAction;
  message: string;
  resource: AppErrorResource;
  result: "failure" | "success";
  targetId?: string | null;
  targetLabel?: string | null;
}

export interface AppErrorOptions<TResponseData = unknown> {
  audit?: AppErrorAuditPayload;
  category: AppErrorCategory;
  cause?: unknown;
  code: AppErrorCode;
  details?: Record<string, unknown>;
  expose: boolean;
  logSink: AppErrorSink;
  responseData?: TResponseData;
  severity: AppErrorSeverity;
  status: number;
}

export class AppError<TResponseData = unknown> extends Error {
  readonly audit?: AppErrorAuditPayload;
  readonly category: AppErrorCategory;
  readonly code: string;
  readonly details: Record<string, unknown>;
  readonly expose: boolean;
  readonly logSink: AppErrorSink;
  requestId?: string;
  readonly responseData?: TResponseData;
  readonly severity: AppErrorSeverity;
  readonly status: number;

  constructor(message: string, options: AppErrorOptions<TResponseData>) {
    super(message, options.cause ? { cause: options.cause } : undefined);
    this.name = new.target.name;
    this.audit = options.audit;
    this.category = options.category;
    this.code = options.code;
    this.details = options.details ?? {};
    this.expose = options.expose;
    this.logSink = options.logSink;
    this.responseData = options.responseData;
    this.severity = options.severity;
    this.status = options.status;
  }
}

export class ValidationError<TResponseData = unknown> extends AppError<TResponseData> {
  constructor(
    message: string,
    options: Omit<AppErrorOptions<TResponseData>, "category">,
  ) {
    super(message, {
      ...options,
      category: APP_ERROR_CATEGORY.validation,
    });
  }
}

export class AuthorizationError<
  TResponseData = unknown,
> extends AppError<TResponseData> {
  constructor(
    message: string,
    options: Omit<AppErrorOptions<TResponseData>, "category">,
  ) {
    super(message, {
      ...options,
      category: APP_ERROR_CATEGORY.authorization,
    });
  }
}

export class BusinessError<TResponseData = unknown> extends AppError<TResponseData> {
  constructor(
    message: string,
    options: Omit<AppErrorOptions<TResponseData>, "category">,
  ) {
    super(message, {
      ...options,
      category: APP_ERROR_CATEGORY.business,
    });
  }
}

export class ConflictError<TResponseData = unknown> extends AppError<TResponseData> {
  constructor(
    message: string,
    options: Omit<AppErrorOptions<TResponseData>, "category">,
  ) {
    super(message, {
      ...options,
      category: APP_ERROR_CATEGORY.business,
    });
  }
}

export class NotFoundError<TResponseData = unknown> extends AppError<TResponseData> {
  constructor(
    message: string,
    options: Omit<AppErrorOptions<TResponseData>, "category">,
  ) {
    super(message, {
      ...options,
      category: APP_ERROR_CATEGORY.notFound,
    });
  }
}

export class InfrastructureError<
  TResponseData = unknown,
> extends AppError<TResponseData> {
  constructor(
    message: string,
    options: Omit<AppErrorOptions<TResponseData>, "category">,
  ) {
    super(message, {
      ...options,
      category: APP_ERROR_CATEGORY.infrastructure,
    });
  }
}

export class ExternalServiceError<
  TResponseData = unknown,
> extends AppError<TResponseData> {
  constructor(
    message: string,
    options: Omit<AppErrorOptions<TResponseData>, "category">,
  ) {
    super(message, {
      ...options,
      category: APP_ERROR_CATEGORY.external,
    });
  }
}

export class InternalServerError<
  TResponseData = unknown,
> extends AppError<TResponseData> {
  constructor(
    message: string,
    options: Omit<AppErrorOptions<TResponseData>, "category">,
  ) {
    super(message, {
      ...options,
      category: APP_ERROR_CATEGORY.internal,
    });
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function markAppErrorReported<TError extends AppError>(error: TError) {
  Object.defineProperty(error, APP_ERROR_REPORTED, {
    configurable: true,
    enumerable: false,
    value: true,
  });

  return error;
}

export function isAppErrorReported(error: unknown) {
  return isAppError(error) && APP_ERROR_REPORTED in error;
}

export function normalizeAppError(error: unknown) {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new InternalServerError("Unexpected application error", {
      cause: error,
      code: APP_ERROR_CODE.internal.unexpected,
      details: {
        originalMessage: error.message,
      },
      expose: false,
      logSink: APP_ERROR_SINK.logErrorHistory,
      severity: APP_ERROR_SEVERITY.error,
      status: 500,
    });
  }

  return new InternalServerError("Unexpected non-error thrown value", {
    code: APP_ERROR_CODE.internal.nonErrorThrow,
    details: {
      thrownType: typeof error,
    },
    expose: false,
    logSink: APP_ERROR_SINK.logErrorHistory,
    severity: APP_ERROR_SEVERITY.error,
    status: 500,
  });
}
