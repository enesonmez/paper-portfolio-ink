import type { AppLoadContext } from "react-router";

import {
  formatLogErrorHistoryExport,
  listLogErrorHistoryEntriesAscending,
} from "~/lib/logging/logs.server";
import { APP_ERROR_ACTION, APP_ERROR_RESOURCE } from "~/shared/errors/contracts";
import { recordAuditLog } from "~/shared/logging/audit.server";

import type { DashboardLoggingRangeSubmission } from "./_shared/support.server";

export async function handleExportLogErrorsMutation(args: {
  context: AppLoadContext;
  request: Request;
  submission: DashboardLoggingRangeSubmission;
}) {
  const rows = await listLogErrorHistoryEntriesAscending(args.context, {
    from: args.submission.startAt,
    to: args.submission.endAt,
  });

  await recordAuditLog({
    action: APP_ERROR_ACTION.export,
    context: args.context,
    details: {
      endAt: args.submission.endAt.toISOString(),
      startAt: args.submission.startAt.toISOString(),
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
      "Content-Disposition": `attachment; filename="log-error-history-${args.submission.startAt.toISOString()}-${args.submission.endAt.toISOString()}.txt"`,
      "Content-Type": "text/plain; charset=utf-8",
    },
    status: 200,
  });
}
