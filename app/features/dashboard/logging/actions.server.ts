import type { AppLoadContext } from "react-router";

import {
  LOGGING_FORM_FIELD,
  LOGGING_MUTATION_INTENT,
  isLoggingMutationIntent,
} from "~/domain/logging/model";
import { parseLoggingRangeFormData } from "~/lib/logging/logging-range-form.server";
import { withDashboardAccess } from "~/shared/authz/authz.server";
import { buildValidationError } from "~/shared/errors/builders.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";
import { readStringField } from "~/shared/forms/form-data.server";
import { loadI18nPayload } from "~/shared/i18n/i18n.server";
import { createTranslator } from "~/shared/i18n/i18n.shared";

import { authorizeLoggingMutationOrThrow } from "./operations/_shared/authorization.server";
import { buildLoggingRangeActionData } from "./operations/_shared/support.server";
import { handleDeleteLogErrorsMutation } from "./operations/delete.server";
import { handleExportLogErrorsMutation } from "./operations/export.server";
import type { DashboardLoggingActionData } from "./state";

export async function handleDashboardLoggingAction(
  context: AppLoadContext,
  request: Request,
) {
  const { messages } = await loadI18nPayload(context, request);
  const t = createTranslator(messages);
  const formData = await request.formData();
  const intent = readStringField(formData, LOGGING_FORM_FIELD.intent);

  if (!isLoggingMutationIntent(intent)) {
    throw buildValidationError<DashboardLoggingActionData>({
      action: APP_ERROR_ACTION.mutate,
      code: APP_ERROR_CODE.logging.mutation.invalidIntent,
      details: {
        intent,
      },
      message: "Logging mutation received an unsupported intent",
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
      const resolveSubmission = () => parseLoggingRangeFormData(formData, t);
      const mutationHandlers = {
        [LOGGING_MUTATION_INTENT.deleteErrors]: () =>
          handleDeleteLogErrorsMutation({
            context,
            request,
            submission: resolveSubmission(),
            t,
          }),
        [LOGGING_MUTATION_INTENT.exportErrors]: () =>
          handleExportLogErrorsMutation({
            context,
            request,
            submission: resolveSubmission(),
          }),
      } as const;

      return mutationHandlers[intent]();
    },
  });
}
