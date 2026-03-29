import { buildUserFormValues, type UserFormState } from "~/domain/users/form";
import { USER_MUTATION_INTENT, type UserMutationIntent } from "~/domain/users/model";
import {
  USER_MUTATION_CLAIMS,
  resolveMutationClaim,
} from "~/shared/authz/action-claims";
import {
  assertClaimAuthorized,
  buildForbiddenFormState,
  type AuthorizationActor,
} from "~/shared/authz/authz.server";
import { AUTHORIZATION_CLAIM } from "~/shared/authz/model";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";

import type { DashboardUsersFormCopy } from "./support.server";

export function authorizeUserMutationOrThrow(args: {
  actor: AuthorizationActor;
  formCopy: Pick<DashboardUsersFormCopy, "errors">;
  intent: UserMutationIntent;
}) {
  const authorization = resolveUserMutationAuthorization(args.intent);

  assertClaimAuthorized<UserFormState>({
    actor: args.actor,
    claim: authorization.requiredClaim,
    error: {
      action: authorization.action,
      code: authorization.code,
      details: {
        intent: args.intent,
        requiredClaim: authorization.requiredClaim,
      },
      message: "User mutation denied by authorization policy",
      resource: APP_ERROR_RESOURCE.users,
      responseData: buildForbiddenFormState(
        args.formCopy.errors.forbidden,
        buildUserFormValues(),
      ),
      status: 403,
    },
  });
}

function resolveUserMutationAuthorization(intent: UserMutationIntent) {
  const requiredClaim = resolveMutationClaim(
    intent,
    USER_MUTATION_CLAIMS,
    AUTHORIZATION_CLAIM.usersCreate,
  );

  if (intent === USER_MUTATION_INTENT.delete) {
    return {
      action: APP_ERROR_ACTION.delete,
      code: APP_ERROR_CODE.users.delete.forbidden,
      requiredClaim,
    };
  }

  if (intent === USER_MUTATION_INTENT.update) {
    return {
      action: APP_ERROR_ACTION.update,
      code: APP_ERROR_CODE.users.update.forbidden,
      requiredClaim,
    };
  }

  return {
    action: APP_ERROR_ACTION.create,
    code: APP_ERROR_CODE.users.create.forbidden,
    requiredClaim,
  };
}
