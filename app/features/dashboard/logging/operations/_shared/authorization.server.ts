import {
  LOGGING_MUTATION_INTENT,
  type LoggingMutationIntent,
} from "~/domain/logging/model";
import {
  LOGGING_MUTATION_CLAIMS,
  resolveMutationClaim,
} from "~/shared/authz/action-claims";
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

import { buildLoggingRangeActionData } from "./support.server";

function resolveLoggingMutationAuthorization(intent: LoggingMutationIntent) {
  const requiredClaim = resolveMutationClaim(
    intent,
    LOGGING_MUTATION_CLAIMS,
    AUTHORIZATION_CLAIM.logsErrorExport,
  );

  if (
    intent === LOGGING_MUTATION_INTENT.deleteErrors ||
    intent === LOGGING_MUTATION_INTENT.deleteHistory
  ) {
    return {
      action: APP_ERROR_ACTION.delete,
      code: APP_ERROR_CODE.logging.delete.forbidden,
      requiredClaim,
    };
  }

  return {
    action: APP_ERROR_ACTION.export,
    code: APP_ERROR_CODE.logging.export.forbidden,
    requiredClaim,
  };
}

export function authorizeLoggingMutationOrThrow(args: {
  actor: AuthorizationActor;
  forbiddenMessage: string;
  intent: LoggingMutationIntent;
}) {
  const authorization = resolveLoggingMutationAuthorization(args.intent);

  assertClaimAuthorized({
    actor: args.actor,
    claim: authorization.requiredClaim,
    error: {
      action: authorization.action,
      code: authorization.code,
      details: {
        intent: args.intent,
        requiredClaim: authorization.requiredClaim,
      },
      message: "Logging mutation denied by authorization policy",
      resource: APP_ERROR_RESOURCE.logs,
      responseData: buildLoggingRangeActionData(args.forbiddenMessage),
      status: 403,
    },
  });
}
