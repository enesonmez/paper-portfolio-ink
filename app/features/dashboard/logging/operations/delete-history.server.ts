import type { AppLoadContext } from "react-router";

import { deleteLogHistoryEntriesByDateRange } from "~/lib/logging/logs.server";
import { APP_ERROR_ACTION, APP_ERROR_RESOURCE } from "~/shared/errors/contracts";
import type { createTranslator } from "~/shared/i18n/i18n.shared";
import { recordAuditLog } from "~/shared/logging/audit.server";

import { buildEmptyRangeFormState, type DashboardLoggingActionData } from "../state";
import type { DashboardLoggingRangeSubmission } from "./_shared/support.server";

export async function handleDeleteLogHistoryMutation(args: {
  context: AppLoadContext;
  request: Request;
  submission: DashboardLoggingRangeSubmission;
  t: ReturnType<typeof createTranslator>;
}) {
  const deletedCount = await deleteLogHistoryEntriesByDateRange(args.context, {
    from: args.submission.startAt,
    to: args.submission.endAt,
  });

  await recordAuditLog({
    action: APP_ERROR_ACTION.delete,
    context: args.context,
    details: {
      deletedCount,
      endAt: args.submission.endAt.toISOString(),
      startAt: args.submission.startAt.toISOString(),
    },
    message: "Audit log range deleted",
    request: args.request,
    resource: APP_ERROR_RESOURCE.logs,
    result: "success",
    statusCode: 200,
    targetLabel: "audit-log-delete",
  });

  return {
    notice: args
      .t("dashboard.logging.deleteHistorySuccess")
      .replace("{count}", String(deletedCount)),
    rangeForm: buildEmptyRangeFormState(),
  } satisfies DashboardLoggingActionData;
}
