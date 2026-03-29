import {
  RESOURCE_MUTATION_INTENT,
  type ResourceMutationIntent,
} from "~/domain/resources/contract";
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

function resolveLocaleMutationAuthorization(
  intent:
    | typeof RESOURCE_MUTATION_INTENT.createLocale
    | typeof RESOURCE_MUTATION_INTENT.deleteLocale
    | typeof RESOURCE_MUTATION_INTENT.updateLocale,
) {
  if (intent === RESOURCE_MUTATION_INTENT.deleteLocale) {
    return {
      action: APP_ERROR_ACTION.delete,
      claim: AUTHORIZATION_CLAIM.resourcesLocalesDelete,
      code: APP_ERROR_CODE.resources.locales.delete.forbidden,
    };
  }

  if (intent === RESOURCE_MUTATION_INTENT.updateLocale) {
    return {
      action: APP_ERROR_ACTION.update,
      claim: AUTHORIZATION_CLAIM.resourcesLocalesUpdate,
      code: APP_ERROR_CODE.resources.locales.update.forbidden,
    };
  }

  return {
    action: APP_ERROR_ACTION.create,
    claim: AUTHORIZATION_CLAIM.resourcesLocalesCreate,
    code: APP_ERROR_CODE.resources.locales.create.forbidden,
  };
}

export function authorizeLocaleMutationOrThrow(args: {
  actor: AuthorizationActor;
  formCopy: DashboardResourcesFormCopy;
  intent:
    | typeof RESOURCE_MUTATION_INTENT.createLocale
    | typeof RESOURCE_MUTATION_INTENT.deleteLocale
    | typeof RESOURCE_MUTATION_INTENT.updateLocale;
}) {
  const authorization = resolveLocaleMutationAuthorization(args.intent);

  assertClaimAuthorized({
    actor: args.actor,
    claim: authorization.claim,
    error: {
      action: authorization.action,
      code: authorization.code,
      details: {
        intent: args.intent satisfies ResourceMutationIntent,
        requiredClaim: authorization.claim,
      },
      message: "Locale mutation denied by authorization policy",
      resource: APP_ERROR_RESOURCE.resourcesLocales,
      responseData: buildActionErrorState(args.formCopy.errors.forbidden, 403),
      status: 403,
    },
  });
}
