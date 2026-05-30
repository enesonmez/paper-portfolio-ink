import type { AppLoadContext } from "react-router";

import {
  buildAccountConfigurationFormValues,
  type AccountConfigurationFormState,
} from "~/domain/configuration/form";
import {
  ACCOUNT_CONFIGURATION_FORM_FIELD,
  ACCOUNT_CONFIGURATION_MUTATION_INTENT,
  isAccountConfigurationMutationIntent,
} from "~/domain/configuration/model";
import {
  actorHasClaim,
  assertAuthorized,
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
import { createTranslator } from "~/shared/i18n/i18n.shared";

import { handleRevokeSessionMutation } from "./operations/revoke-session.server";
import { handleRevokeOtherSessionsMutation } from "./operations/revoke-other-sessions.server";
import { handleRevokeAllSessionsMutation } from "./operations/revoke-all-sessions.server";
import { handleUpdateAccountConfigurationMutation } from "./operations/update.server";

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

  const isSecurityIntent =
    intent === ACCOUNT_CONFIGURATION_MUTATION_INTENT.revokeSession ||
    intent === ACCOUNT_CONFIGURATION_MUTATION_INTENT.revokeOtherSessions ||
    intent === ACCOUNT_CONFIGURATION_MUTATION_INTENT.revokeAllSessions;

  const errorAction = isSecurityIntent
    ? APP_ERROR_ACTION.delete
    : APP_ERROR_ACTION.update;

  const errorCode = isSecurityIntent
    ? APP_ERROR_CODE.settings.delete.forbidden
    : APP_ERROR_CODE.settings.update.forbidden;

  return withDashboardAccess({
    request,
    context,
    authorize: ({ actor }) =>
      assertAuthorized({
        isAllowed: isSecurityIntent
          ? actorHasClaim(actor, AUTHORIZATION_CLAIM.settingsSecurityManageOwn) ||
            actorHasClaim(actor, AUTHORIZATION_CLAIM.settingsSecurityManageAny)
          : actorHasClaim(actor, AUTHORIZATION_CLAIM.settingsAccountManage),
        error: {
          action: errorAction,
          code: errorCode,
          details: {
            intent,
          },
          message: "Settings mutation denied by authorization policy",
          resource: APP_ERROR_RESOURCE.settings,
          responseData: isSecurityIntent
            ? undefined
            : buildForbiddenFormState(
                t("dashboard.authz.forbiddenError"),
                buildAccountConfigurationFormValues(),
              ),
          status: 403,
        },
      }),
    handle: ({ actor }) => {
      const mutationHandlers = {
        [ACCOUNT_CONFIGURATION_MUTATION_INTENT.revokeSession]: () =>
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
        [ACCOUNT_CONFIGURATION_MUTATION_INTENT.revokeOtherSessions]: () =>
          handleRevokeOtherSessionsMutation({
            actor,
            context,
            intent,
            locale,
            request,
            supportedLocaleCodes,
            t,
          }),
        [ACCOUNT_CONFIGURATION_MUTATION_INTENT.revokeAllSessions]: () =>
          handleRevokeAllSessionsMutation({
            actor,
            context,
            intent,
            locale,
            request,
            supportedLocaleCodes,
            t,
          }),
        [ACCOUNT_CONFIGURATION_MUTATION_INTENT.update]: () =>
          handleUpdateAccountConfigurationMutation({
            context,
            formData,
            intent,
            locale,
            request,
            supportedLocaleCodes,
            t,
          }),
      } as const;

      return mutationHandlers[intent]();
    },
  });
}
