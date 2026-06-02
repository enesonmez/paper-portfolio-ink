import { assertAuthorized, type AuthorizationActor } from "~/shared/authz/authz.server";
import { AUTHORIZATION_CLAIM } from "~/shared/authz/model";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";

import {
  isSettingsSecurityMutationIntent,
  SETTINGS_MUTATION_INTENT,
  type SettingsMutationIntent,
} from "../../contracts";
import { buildSettingsAccountActionData } from "./support.server";

function resolveSettingsMutationAuthorization(intent: SettingsMutationIntent) {
  if (intent === SETTINGS_MUTATION_INTENT.refreshRuntimeCache) {
    return {
      action: APP_ERROR_ACTION.update,
      code: APP_ERROR_CODE.settings.update.forbidden,
      isAllowed: (actor: AuthorizationActor) =>
        actor.claims.includes(AUTHORIZATION_CLAIM.settingsRuntimeManage),
      responseData: undefined,
    };
  }

  if (isSettingsSecurityMutationIntent(intent)) {
    return {
      action: APP_ERROR_ACTION.delete,
      code: APP_ERROR_CODE.settings.delete.forbidden,
      isAllowed: (actor: AuthorizationActor) =>
        actor.claims.includes(AUTHORIZATION_CLAIM.settingsSecurityManageOwn) ||
        actor.claims.includes(AUTHORIZATION_CLAIM.settingsSecurityManageAny),
      responseData: undefined,
    };
  }

  return {
    action: APP_ERROR_ACTION.update,
    code: APP_ERROR_CODE.settings.update.forbidden,
    isAllowed: (actor: AuthorizationActor) =>
      actor.claims.includes(AUTHORIZATION_CLAIM.settingsAccountManage),
    responseData: buildSettingsAccountActionData,
  };
}

export function authorizeSettingsMutationOrThrow(args: {
  actor: AuthorizationActor;
  forbiddenMessage: string;
  intent: SettingsMutationIntent;
}) {
  const authorization = resolveSettingsMutationAuthorization(args.intent);

  assertAuthorized({
    error: {
      action: authorization.action,
      code: authorization.code,
      details: {
        intent: args.intent,
      },
      message: "Settings mutation denied by authorization policy",
      resource: APP_ERROR_RESOURCE.settings,
      responseData: authorization.responseData
        ? authorization.responseData(args.forbiddenMessage)
        : undefined,
      status: 403,
    },
    isAllowed: authorization.isAllowed(args.actor),
  });
}
