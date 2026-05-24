import type { AppLoadContext } from "react-router";

import {
  DASHBOARD_LOGGING_EXPORT_MAX_ROWS,
  listLogHistoryEntriesAscending,
} from "~/lib/logging/logs.server";
import { buildValidationError } from "~/shared/errors/builders.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";
import { buildExcelWorkbook } from "~/shared/export/xlsx.server";
import type { createTranslator } from "~/shared/i18n/i18n.shared";
import { recordAuditLog } from "~/shared/logging/audit.server";

import type { DashboardLoggingActionData } from "../state";
import type { DashboardLoggingRangeSubmission } from "./_shared/support.server";
import { buildLoggingRangeActionData } from "./_shared/support.server";

function buildLogHistoryWorkbook(
  rows: Awaited<ReturnType<typeof listLogHistoryEntriesAscending>>,
) {
  return buildExcelWorkbook({
    columns: [
      { key: "id", label: "ID" },
      { key: "createdAt", label: "Created At" },
      { key: "requestId", label: "Request ID" },
      { key: "resource", label: "Resource" },
      { key: "action", label: "Action" },
      { key: "result", label: "Result" },
      { key: "statusCode", label: "Status Code" },
      { key: "message", label: "Message" },
      { key: "path", label: "Path" },
      { key: "method", label: "Method" },
      { key: "userId", label: "User ID" },
      { key: "userRole", label: "User Role" },
      { key: "targetId", label: "Target ID" },
      { key: "targetLabel", label: "Target Label" },
      { key: "metadataJson", label: "Metadata JSON" },
    ] as const,
    rows,
    sheetName: "Audit Logs",
  });
}

export async function handleExportLogHistoryMutation(args: {
  context: AppLoadContext;
  request: Request;
  submission: DashboardLoggingRangeSubmission;
  t: ReturnType<typeof createTranslator>;
}) {
  const rows = await listLogHistoryEntriesAscending(
    args.context,
    {
      from: args.submission.startAt,
      to: args.submission.endAt,
    },
    {
      limit: DASHBOARD_LOGGING_EXPORT_MAX_ROWS + 1,
    },
  );

  if (rows.length > DASHBOARD_LOGGING_EXPORT_MAX_ROWS) {
    throw buildValidationError<DashboardLoggingActionData>({
      action: APP_ERROR_ACTION.export,
      code: APP_ERROR_CODE.logging.export.limitExceeded,
      details: {
        limit: DASHBOARD_LOGGING_EXPORT_MAX_ROWS,
      },
      message: "Audit log export range exceeded the maximum row limit",
      resource: APP_ERROR_RESOURCE.logs,
      responseData: buildLoggingRangeActionData(
        args
          .t("dashboard.logging.exportLimitError")
          .replace("{count}", String(DASHBOARD_LOGGING_EXPORT_MAX_ROWS)),
        args.submission.values,
      ),
      status: 400,
    });
  }

  await recordAuditLog({
    action: APP_ERROR_ACTION.export,
    context: args.context,
    details: {
      endAt: args.submission.endAt.toISOString(),
      startAt: args.submission.startAt.toISOString(),
    },
    message: "Audit log range exported",
    request: args.request,
    resource: APP_ERROR_RESOURCE.logs,
    result: "success",
    statusCode: 200,
    targetLabel: "audit-log-export",
  });

  return new Response(buildLogHistoryWorkbook(rows), {
    headers: {
      "Content-Disposition": `attachment; filename="log-history-${args.submission.startAt.toISOString()}-${args.submission.endAt.toISOString()}.xlsx"`,
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
    status: 200,
  });
}
