import type { AppLoadContext } from "react-router";

import type { AccountConfigurationFormState } from "~/domain/configuration/form";
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

import { authorizeSettingsMutationOrThrow } from "./operations/_shared/authorization.server";
import { buildSettingsAccountActionData } from "./operations/_shared/support.server";
import {
  isSettingsMutationIntent,
  SETTINGS_MUTATION_FORM_FIELD,
  SETTINGS_MUTATION_INTENT,
  type SettingsMutationIntent,
} from "./contracts";
import { handleRefreshRuntimeCacheMutation } from "./operations/refresh-runtime-cache.server";
import { handleRevokeSessionMutation } from "./operations/revoke-session.server";
import { handleRevokeOtherSessionsMutation } from "./operations/revoke-other-sessions.server";
import { handleRevokeAllSessionsMutation } from "./operations/revoke-all-sessions.server";
import { handleUpdateAccountConfigurationMutation } from "./operations/update.server";

function buildInvalidIntentFormState(message: string) {
  const actionData = buildSettingsAccountActionData(message);

  return actionData.accountForm as AccountConfigurationFormState;
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
  const intent = readStringField(formData, SETTINGS_MUTATION_FORM_FIELD.intent);

  if (!isSettingsMutationIntent(intent)) {
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
      authorizeSettingsMutationOrThrow({
        actor,
        forbiddenMessage: t("dashboard.authz.forbiddenError"),
        intent,
      }),
    handle: ({ actor }) => {
      const mutationHandlers: Record<SettingsMutationIntent, () => Promise<Response>> =
        {
          [SETTINGS_MUTATION_INTENT.revokeSession]: () =>
            handleRevokeSessionMutation({
              actor,
              context,
              formData,
              intent,
              locale,
              request,
              supportedLocaleCodes,
              t,
            }),
          [SETTINGS_MUTATION_INTENT.revokeOtherSessions]: () =>
            handleRevokeOtherSessionsMutation({
              actor,
              context,
              intent,
              locale,
              request,
              supportedLocaleCodes,
              t,
            }),
          [SETTINGS_MUTATION_INTENT.revokeAllSessions]: () =>
            handleRevokeAllSessionsMutation({
              actor,
              context,
              intent,
              locale,
              request,
              supportedLocaleCodes,
              t,
            }),
          [SETTINGS_MUTATION_INTENT.updateAccountConfiguration]: () =>
            handleUpdateAccountConfigurationMutation({
              context,
              formData,
              intent,
              locale,
              request,
              supportedLocaleCodes,
              t,
            }),
          [SETTINGS_MUTATION_INTENT.refreshRuntimeCache]: () =>
            handleRefreshRuntimeCacheMutation({
              actor,
              context,
              formData,
              intent,
              locale,
              request,
              supportedLocaleCodes,
            }),
        } as const;

      return mutationHandlers[intent]();
    },
  });
}
