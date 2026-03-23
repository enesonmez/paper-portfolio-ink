import type { AppLoadContext } from "react-router";

import type { AuthorizationActor } from "~/shared/authz/actor";
import {
  RESOURCE_FORM_FIELD,
  RESOURCE_MUTATION_INTENT,
} from "~/domain/resources/contract";
import { buildBusinessError } from "~/shared/errors/builders.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";
import { readStringField } from "~/shared/forms/form-data.server";
import type { I18nTranslator } from "~/shared/i18n/i18n.shared";

import type { DashboardResourcesFormCopy } from "./copy";
import { buildActionErrorState } from "./action-state.server";
import {
  handleCreateLocaleMutation,
  handleDeleteLocaleMutation,
  handleUpdateLocaleMutation,
} from "./locales/mutations.server";
import {
  handleCreateTranslationMutation,
  handleDeleteTranslationMutation,
  handleUpdateTranslationMutation,
} from "./translations/mutations.server";

interface HandleDashboardResourcesMutationArgs {
  actor: AuthorizationActor;
  context: AppLoadContext;
  currentLocale: string;
  formCopy: DashboardResourcesFormCopy;
  request: Request;
  t: I18nTranslator;
}

export async function handleDashboardResourcesMutation(
  args: HandleDashboardResourcesMutationArgs,
) {
  const formData = await args.request.formData();
  const intent = readStringField(formData, RESOURCE_FORM_FIELD.intent);
  const mutationArgs = {
    actor: args.actor,
    context: args.context,
    currentLocale: args.currentLocale,
    formCopy: args.formCopy,
    formData,
    request: args.request,
    t: args.t,
  } as const;

  switch (intent) {
    case RESOURCE_MUTATION_INTENT.createLocale:
      return handleCreateLocaleMutation({
        ...mutationArgs,
        intent,
      });

    case RESOURCE_MUTATION_INTENT.deleteLocale:
      return handleDeleteLocaleMutation({
        ...mutationArgs,
        intent,
      });

    case RESOURCE_MUTATION_INTENT.updateLocale:
      return handleUpdateLocaleMutation({
        ...mutationArgs,
        intent,
      });

    case RESOURCE_MUTATION_INTENT.createTranslation:
      return handleCreateTranslationMutation({
        ...mutationArgs,
        intent,
      });

    case RESOURCE_MUTATION_INTENT.deleteTranslation:
      return handleDeleteTranslationMutation({
        ...mutationArgs,
        intent,
      });

    case RESOURCE_MUTATION_INTENT.updateTranslation:
      return handleUpdateTranslationMutation({
        ...mutationArgs,
        intent,
      });
  }

  throw buildBusinessError({
    action: APP_ERROR_ACTION.mutate,
    code: APP_ERROR_CODE.resources.mutation.invalidIntent,
    details: {
      intent,
    },
    message: "Resource mutation received an unsupported intent",
    resource: APP_ERROR_RESOURCE.resources,
    responseData: buildActionErrorState(args.formCopy.errors.forbidden, 400),
    status: 400,
  });
}
