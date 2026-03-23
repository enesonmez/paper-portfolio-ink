import type { AppLoadContext } from "react-router";

import type { AuthorizationActor } from "~/shared/authz/actor";
import { denyActionIfMissingClaim } from "~/shared/authz/guards";
import { AUTHORIZATION_CLAIM } from "~/shared/authz/model";
import { buildAuthorizationError } from "~/shared/errors/builders.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";
import type { createTranslator } from "~/shared/i18n/i18n.shared";
import {
  deleteLogErrorHistoryEntriesByDateRange,
  formatLogErrorHistoryExport,
  listLogErrorHistoryEntriesAscending,
} from "~/lib/logging/logs.server";
import { recordAuditLog } from "~/shared/logging/audit.server";

import { buildEmptyRangeFormState, type DashboardLoggingActionData } from "./state";

function buildForbiddenRangeState(
  values: { endAt: string; startAt: string },
  t: ReturnType<typeof createTranslator>,
) {
  return {
    rangeForm: {
      errors: {
        form: t("dashboard.authz.forbiddenError"),
      },
      values,
    },
  } satisfies DashboardLoggingActionData;
}

export async function handleExportLogErrorsMutation(args: {
  actor: AuthorizationActor;
  context: AppLoadContext;
  endAt: Date;
  request: Request;
  startAt: Date;
  t: ReturnType<typeof createTranslator>;
  values: {
    endAt: string;
    startAt: string;
  };
}) {
  const forbidden = denyActionIfMissingClaim(
    args.actor,
    AUTHORIZATION_CLAIM.logsExport,
    buildForbiddenRangeState(args.values, args.t),
  );

  if (forbidden) {
    throw buildAuthorizationError({
      action: APP_ERROR_ACTION.export,
      code: APP_ERROR_CODE.logging.exportForbidden,
      message: "Logging export denied by authorization policy",
      resource: APP_ERROR_RESOURCE.logs,
      responseData: forbidden,
      status: 403,
    });
  }

  const rows = await listLogErrorHistoryEntriesAscending(args.context, {
    from: args.startAt,
    to: args.endAt,
  });
  await recordAuditLog({
    action: APP_ERROR_ACTION.export,
    context: args.context,
    details: {
      endAt: args.endAt.toISOString(),
      startAt: args.startAt.toISOString(),
    },
    message: "Error log range exported",
    request: args.request,
    resource: APP_ERROR_RESOURCE.logs,
    result: "success",
    statusCode: 200,
    targetLabel: "error-log-export",
  });

  return new Response(formatLogErrorHistoryExport(rows), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="log-error-history-${args.startAt.toISOString()}-${args.endAt.toISOString()}.txt"`,
    },
    status: 200,
  });
}

export async function handleDeleteLogErrorsMutation(args: {
  actor: AuthorizationActor;
  context: AppLoadContext;
  endAt: Date;
  request: Request;
  startAt: Date;
  t: ReturnType<typeof createTranslator>;
  values: {
    endAt: string;
    startAt: string;
  };
}) {
  const forbidden = denyActionIfMissingClaim(
    args.actor,
    AUTHORIZATION_CLAIM.logsDelete,
    buildForbiddenRangeState(args.values, args.t),
  );

  if (forbidden) {
    throw buildAuthorizationError({
      action: APP_ERROR_ACTION.delete,
      code: APP_ERROR_CODE.logging.deleteForbidden,
      message: "Logging deletion denied by authorization policy",
      resource: APP_ERROR_RESOURCE.logs,
      responseData: forbidden,
      status: 403,
    });
  }

  const deletedCount = await deleteLogErrorHistoryEntriesByDateRange(args.context, {
    from: args.startAt,
    to: args.endAt,
  });
  await recordAuditLog({
    action: APP_ERROR_ACTION.delete,
    context: args.context,
    details: {
      deletedCount,
      endAt: args.endAt.toISOString(),
      startAt: args.startAt.toISOString(),
    },
    message: "Error log range deleted",
    request: args.request,
    resource: APP_ERROR_RESOURCE.logs,
    result: "success",
    statusCode: 200,
    targetLabel: "error-log-delete",
  });

  return {
    notice: args
      .t("dashboard.logging.deleteSuccess")
      .replace("{count}", String(deletedCount)),
    rangeForm: buildEmptyRangeFormState(),
  } satisfies DashboardLoggingActionData;
}
