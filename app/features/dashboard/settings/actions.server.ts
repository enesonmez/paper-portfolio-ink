import { redirect, type AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../db/context";
import {
  buildAccountConfigurationFormValues,
  type AccountConfigurationFormState,
} from "~/domain/configuration/form";
import {
  ACCOUNT_CONFIGURATION_FORM_FIELD,
  isAccountConfigurationMutationIntent,
} from "~/domain/configuration/model";
import {
  purgeAccountConfigurationCache,
  updateAccountConfigurationParameter,
} from "~/lib/configuration/configuration.server";
import { parseAccountConfigurationFormData } from "~/lib/configuration/configuration-form.server";
import {
  assertClaimAuthorized,
  buildForbiddenFormState,
  withDashboardAccess,
} from "~/shared/authz/authz.server";
import { AUTHORIZATION_CLAIM } from "~/shared/authz/model";
import { buildValidationError } from "~/shared/errors/builders.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";
import { readStringField } from "~/shared/forms/form-data.server";
import { loadI18nPayload } from "~/shared/i18n/i18n.server";
import { buildLocalizedPath, createTranslator } from "~/shared/i18n/i18n.shared";
import { recordAuditLog } from "~/shared/logging/audit.server";

import { buildDashboardSettingsHref } from "./state";

function buildInvalidIntentFormState(message: string) {
  return {
    errors: {
      form: message,
    },
    values: buildAccountConfigurationFormValues(),
  } satisfies AccountConfigurationFormState;
}

export async function handleDashboardSettingsAction(
  context: AppLoadContext,
  request: Request,
) {
  const { locale, messages, supportedLocales } = await loadI18nPayload(
    context,
    request,
  );
  const t = createTranslator(messages);
  const supportedLocaleCodes = supportedLocales.map((item) => item.code);
  const formData = await request.formData();
  const intent = readStringField(formData, ACCOUNT_CONFIGURATION_FORM_FIELD.intent);

  if (!isAccountConfigurationMutationIntent(intent)) {
    throw buildValidationError({
      action: APP_ERROR_ACTION.mutate,
      code: APP_ERROR_CODE.settings.mutation.invalidIntent,
      details: {
        intent,
      },
      message: "Settings mutation received an unsupported intent",
      resource: APP_ERROR_RESOURCE.settings,
      responseData: buildInvalidIntentFormState(t("dashboard.authz.forbiddenError")),
      status: 400,
    });
  }

  return withDashboardAccess({
    request,
    context,
    authorize: ({ actor }) =>
      assertClaimAuthorized<AccountConfigurationFormState>({
        actor,
        claim: AUTHORIZATION_CLAIM.settingsManage,
        error: {
          action: APP_ERROR_ACTION.update,
          code: APP_ERROR_CODE.settings.update.forbidden,
          details: {
            intent,
            requiredClaim: AUTHORIZATION_CLAIM.settingsManage,
          },
          message: "Settings mutation denied by authorization policy",
          resource: APP_ERROR_RESOURCE.settings,
          responseData: buildForbiddenFormState(
            t("dashboard.authz.forbiddenError"),
            buildAccountConfigurationFormValues(),
          ),
          status: 403,
        },
      }),
    handle: async () => {
      const submission = parseAccountConfigurationFormData(formData, t);
      const db = getDbFromContext(context);

      await updateAccountConfigurationParameter(db, submission);
      await purgeAccountConfigurationCache(context, request);
      await recordAuditLog({
        action: APP_ERROR_ACTION.update,
        context,
        details: {
          intent,
          key: submission.key,
        },
        message: "Account configuration updated",
        request,
        resource: APP_ERROR_RESOURCE.settings,
        result: "success",
        statusCode: 302,
        targetId: submission.key,
        targetLabel: submission.key,
      });

      return redirect(
        buildLocalizedPath(
          locale,
          buildDashboardSettingsHref("account"),
          supportedLocaleCodes,
        ),
      );
    },
  });
}
