import { buildValidationError } from "./builders.server";
import type { AppErrorAction, AppErrorCode, AppErrorResource } from "./contracts";

export function resolveParsedSubmission<TSubmission, TErrorState>(args: {
  action: AppErrorAction;
  code: AppErrorCode;
  message: string;
  resource: AppErrorResource;
  submission: TSubmission | TErrorState | { data: TSubmission };
}) {
  const candidate = args.submission as { data?: TSubmission };

  if ("data" in candidate) {
    return candidate.data as TSubmission;
  }

  if (
    args.submission &&
    typeof args.submission === "object" &&
    "errors" in (args.submission as object) &&
    "values" in (args.submission as object)
  ) {
    throw buildValidationError<TErrorState>({
      action: args.action,
      code: args.code,
      message: args.message,
      resource: args.resource,
      responseData: args.submission as TErrorState,
      status: 400,
    });
  }

  return args.submission as TSubmission;
}
