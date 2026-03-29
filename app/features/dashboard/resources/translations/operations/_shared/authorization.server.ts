import { RESOURCE_MUTATION_INTENT } from "~/domain/resources/contract";
import {
  assertClaimAuthorized,
  type AuthorizationActor,
} from "~/shared/authz/authz.server";
import { AUTHORIZATION_CLAIM } from "~/shared/authz/model";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";

import { buildActionErrorState } from "../../../forms/form-state.server";
import type { DashboardResourcesFormCopy } from "../../../copy";

function resolveTranslationMutationAuthorization(
  intent:
    | typeof RESOURCE_MUTATION_INTENT.createTranslation
    | typeof RESOURCE_MUTATION_INTENT.deleteTranslation
    | typeof RESOURCE_MUTATION_INTENT.updateTranslation,
) {
  if (intent === RESOURCE_MUTATION_INTENT.deleteTranslation) {
    return {
      action: APP_ERROR_ACTION.delete,
      claim: AUTHORIZATION_CLAIM.resourcesTranslationsDelete,
      code: APP_ERROR_CODE.resources.translations.delete.forbidden,
    };
  }

  if (intent === RESOURCE_MUTATION_INTENT.updateTranslation) {
    return {
      action: APP_ERROR_ACTION.update,
      claim: AUTHORIZATION_CLAIM.resourcesTranslationsUpdate,
      code: APP_ERROR_CODE.resources.translations.update.forbidden,
    };
  }

  return {
    action: APP_ERROR_ACTION.create,
    claim: AUTHORIZATION_CLAIM.resourcesTranslationsCreate,
    code: APP_ERROR_CODE.resources.translations.create.forbidden,
  };
}

export function authorizeTranslationMutationOrThrow(args: {
  actor: AuthorizationActor;
  formCopy: DashboardResourcesFormCopy;
  intent:
    | typeof RESOURCE_MUTATION_INTENT.createTranslation
    | typeof RESOURCE_MUTATION_INTENT.deleteTranslation
    | typeof RESOURCE_MUTATION_INTENT.updateTranslation;
}) {
  const authorization = resolveTranslationMutationAuthorization(args.intent);

  assertClaimAuthorized({
    actor: args.actor,
    claim: authorization.claim,
    error: {
      action: authorization.action,
      code: authorization.code,
      details: {
        intent: args.intent,
        requiredClaim: authorization.claim,
      },
      message: "Translation mutation denied by authorization policy",
      resource: APP_ERROR_RESOURCE.resourcesTranslations,
      responseData: buildActionErrorState(args.formCopy.errors.forbidden, 403),
      status: 403,
    },
  });
}
