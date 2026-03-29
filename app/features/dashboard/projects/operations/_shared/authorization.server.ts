import { buildProjectFormValues, type ProjectFormState } from "~/domain/projects/form";
import {
  PROJECT_MUTATION_INTENT,
  type ProjectMutationIntent,
} from "~/domain/projects/model";
import {
  PROJECT_MUTATION_CLAIMS,
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

import type { DashboardProjectsFormCopy } from "./support.server";

export function authorizeProjectMutationOrThrow(args: {
  actor: AuthorizationActor;
  formCopy: Pick<DashboardProjectsFormCopy, "errors">;
  intent: ProjectMutationIntent;
}) {
  const authorization = resolveProjectMutationAuthorization(args.intent);

  assertClaimAuthorized<ProjectFormState>({
    actor: args.actor,
    claim: authorization.requiredClaim,
    error: {
      action: authorization.action,
      code: authorization.code,
      details: {
        intent: args.intent,
        requiredClaim: authorization.requiredClaim,
      },
      message: "Project mutation denied by authorization policy",
      resource: APP_ERROR_RESOURCE.projects,
      responseData: buildForbiddenFormState(
        args.formCopy.errors.forbidden,
        buildProjectFormValues(),
      ),
      status: 403,
    },
  });
}

function resolveProjectMutationAuthorization(intent: ProjectMutationIntent) {
  const requiredClaim = resolveMutationClaim(
    intent,
    PROJECT_MUTATION_CLAIMS,
    AUTHORIZATION_CLAIM.projectsCreate,
  );

  if (intent === PROJECT_MUTATION_INTENT.delete) {
    return {
      action: APP_ERROR_ACTION.delete,
      code: APP_ERROR_CODE.projects.delete.forbidden,
      requiredClaim,
    };
  }

  if (intent === PROJECT_MUTATION_INTENT.update) {
    return {
      action: APP_ERROR_ACTION.update,
      code: APP_ERROR_CODE.projects.update.forbidden,
      requiredClaim,
    };
  }

  return {
    action: APP_ERROR_ACTION.create,
    code: APP_ERROR_CODE.projects.create.forbidden,
    requiredClaim,
  };
}
