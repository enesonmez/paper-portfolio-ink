import type { AppLoadContext } from "react-router";

import {
  RESOURCE_FORM_FIELD,
  RESOURCE_MUTATION_INTENT,
  type ResourceMutationIntent,
  isResourceMutationIntent,
} from "~/domain/resources/contract";
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

import { buildActionErrorState } from "./forms/form-state.server";
import { buildDashboardResourcesFormCopy } from "./copy";
import { authorizeLocaleMutationOrThrow } from "./locales/operations/_shared/authorization.server";
import { handleCreateLocaleMutation } from "./locales/operations/create.server";
import { handleDeleteLocaleMutation } from "./locales/operations/delete.server";
import { handleUpdateLocaleMutation } from "./locales/operations/update.server";
import { authorizeTranslationMutationOrThrow } from "./translations/operations/_shared/authorization.server";
import { handleCreateTranslationMutation } from "./translations/operations/create.server";
import { handleDeleteTranslationMutation } from "./translations/operations/delete.server";
import { handleUpdateTranslationMutation } from "./translations/operations/update.server";

function isLocaleMutationIntent(
  intent: ResourceMutationIntent,
): intent is
  | typeof RESOURCE_MUTATION_INTENT.createLocale
  | typeof RESOURCE_MUTATION_INTENT.deleteLocale
  | typeof RESOURCE_MUTATION_INTENT.updateLocale {
  return (
    intent === RESOURCE_MUTATION_INTENT.createLocale ||
    intent === RESOURCE_MUTATION_INTENT.deleteLocale ||
    intent === RESOURCE_MUTATION_INTENT.updateLocale
  );
}

export async function handleDashboardResourcesAction(
  context: AppLoadContext,
  request: Request,
) {
  const { locale, messages } = await loadI18nPayload(context, request);
  const t = createTranslator(messages);
  const formCopy = buildDashboardResourcesFormCopy(t);
  const formData = await request.formData();
  const intent = readStringField(formData, RESOURCE_FORM_FIELD.intent);

  if (!isResourceMutationIntent(intent)) {
    throw buildValidationError({
      action: APP_ERROR_ACTION.mutate,
      code: APP_ERROR_CODE.resources.mutation.invalidIntent,
      details: {
        intent,
      },
      message: "Resource mutation received an unsupported intent",
      resource: APP_ERROR_RESOURCE.resources,
      responseData: buildActionErrorState(formCopy.errors.forbidden, 400),
      status: 400,
    });
  }

  return withDashboardAccess({
    request,
    context,
    authorize: ({ actor }) => {
      if (isLocaleMutationIntent(intent)) {
        authorizeLocaleMutationOrThrow({
          actor,
          formCopy,
          intent,
        });
        return;
      }

      authorizeTranslationMutationOrThrow({
        actor,
        formCopy,
        intent,
      });
    },
    handle: () => {
      const mutationHandlers = {
        [RESOURCE_MUTATION_INTENT.createLocale]: () =>
          handleCreateLocaleMutation({
            context,
            currentLocale: locale,
            formCopy,
            formData,
            intent: RESOURCE_MUTATION_INTENT.createLocale,
            request,
            t,
          }),
        [RESOURCE_MUTATION_INTENT.deleteLocale]: () =>
          handleDeleteLocaleMutation({
            context,
            currentLocale: locale,
            formCopy,
            formData,
            intent: RESOURCE_MUTATION_INTENT.deleteLocale,
            request,
            t,
          }),
        [RESOURCE_MUTATION_INTENT.updateLocale]: () =>
          handleUpdateLocaleMutation({
            context,
            currentLocale: locale,
            formCopy,
            formData,
            intent: RESOURCE_MUTATION_INTENT.updateLocale,
            request,
            t,
          }),
        [RESOURCE_MUTATION_INTENT.createTranslation]: () =>
          handleCreateTranslationMutation({
            context,
            currentLocale: locale,
            formCopy,
            formData,
            intent: RESOURCE_MUTATION_INTENT.createTranslation,
            request,
            t,
          }),
        [RESOURCE_MUTATION_INTENT.deleteTranslation]: () =>
          handleDeleteTranslationMutation({
            context,
            currentLocale: locale,
            formCopy,
            formData,
            intent: RESOURCE_MUTATION_INTENT.deleteTranslation,
            request,
            t,
          }),
        [RESOURCE_MUTATION_INTENT.updateTranslation]: () =>
          handleUpdateTranslationMutation({
            context,
            currentLocale: locale,
            formCopy,
            formData,
            intent: RESOURCE_MUTATION_INTENT.updateTranslation,
            request,
            t,
          }),
      } as const;

      return mutationHandlers[intent]();
    },
  });
}
