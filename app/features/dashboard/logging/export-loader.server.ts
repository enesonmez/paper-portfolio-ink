import type { AppLoadContext } from "react-router";

import { LOGGING_FORM_FIELD, LOGGING_MUTATION_INTENT } from "~/domain/logging/model";
import { parseLoggingRangeSearchParams } from "~/lib/logging/logging-range-form.server";
import { withDashboardAccess } from "~/shared/authz/authz.server";
import { buildValidationError } from "~/shared/errors/builders.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";
import { loadI18nPayload } from "~/shared/i18n/i18n.server";
import { createTranslator } from "~/shared/i18n/i18n.shared";

import { authorizeLoggingMutationOrThrow } from "./operations/_shared/authorization.server";
import { buildLoggingRangeActionData } from "./operations/_shared/support.server";
import { handleExportLogHistoryMutation } from "./operations/export-history.server";
import { handleExportLogErrorsMutation } from "./operations/export.server";
import type { DashboardLoggingActionData } from "./state";

export async function loadDashboardLoggingExportFile(
  context: AppLoadContext,
  request: Request,
) {
  const { messages } = await loadI18nPayload(context, request);
  const t = createTranslator(messages);
  const url = new URL(request.url);
  const intent = url.searchParams.get(LOGGING_FORM_FIELD.intent);

  if (
    intent !== LOGGING_MUTATION_INTENT.exportErrors &&
    intent !== LOGGING_MUTATION_INTENT.exportHistory
  ) {
    throw buildValidationError<DashboardLoggingActionData>({
      action: APP_ERROR_ACTION.export,
      code: APP_ERROR_CODE.logging.mutation.invalidIntent,
      details: {
        intent,
      },
      message: "Logging export route received an unsupported intent",
      resource: APP_ERROR_RESOURCE.logs,
      responseData: buildLoggingRangeActionData(t("dashboard.authz.forbiddenError")),
      status: 400,
    });
  }

  return withDashboardAccess({
    request,
    context,
    authorize: ({ actor }) =>
      authorizeLoggingMutationOrThrow({
        actor,
        forbiddenMessage: t("dashboard.authz.forbiddenError"),
        intent,
      }),
    handle: () => {
      const submission = parseLoggingRangeSearchParams(url.searchParams, t);

      if (intent === LOGGING_MUTATION_INTENT.exportHistory) {
        return handleExportLogHistoryMutation({
          context,
          request,
          submission,
          t,
        });
      }

      return handleExportLogErrorsMutation({
        context,
        request,
        submission,
        t,
      });
    },
  });
}
