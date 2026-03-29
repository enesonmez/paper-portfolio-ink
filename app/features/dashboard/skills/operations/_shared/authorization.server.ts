import { buildSkillFormValues, type SkillFormState } from "~/domain/skills/form";
import { SKILL_MUTATION_INTENT, type SkillMutationIntent } from "~/domain/skills/model";
import {
  SKILL_MUTATION_CLAIMS,
  resolveMutationClaim,
} from "~/shared/authz/action-claims";
import {
  buildForbiddenFormState,
  assertClaimAuthorized,
  type AuthorizationActor,
} from "~/shared/authz/authz.server";
import { AUTHORIZATION_CLAIM } from "~/shared/authz/model";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";

import type { DashboardSkillsFormCopy } from "./support.server";

export function authorizeSkillMutationOrThrow(args: {
  actor: AuthorizationActor;
  formCopy: Pick<DashboardSkillsFormCopy, "errors">;
  intent: SkillMutationIntent;
}) {
  const authorization = resolveSkillMutationAuthorization(args.intent);

  assertClaimAuthorized<SkillFormState>({
    actor: args.actor,
    claim: authorization.requiredClaim,
    error: {
      action: authorization.action,
      code: authorization.code,
      details: {
        intent: args.intent,
        requiredClaim: authorization.requiredClaim,
      },
      message: "Skill mutation denied by authorization policy",
      resource: APP_ERROR_RESOURCE.skills,
      responseData: buildForbiddenFormState(
        args.formCopy.errors.forbidden,
        buildSkillFormValues(),
      ),
      status: 403,
    },
  });
}

function resolveSkillMutationAuthorization(intent: SkillMutationIntent) {
  const requiredClaim = resolveMutationClaim(
    intent,
    SKILL_MUTATION_CLAIMS,
    AUTHORIZATION_CLAIM.skillsCreate,
  );

  if (intent === SKILL_MUTATION_INTENT.delete) {
    return {
      action: APP_ERROR_ACTION.delete,
      code: APP_ERROR_CODE.skills.delete.forbidden,
      requiredClaim,
    };
  }

  if (intent === SKILL_MUTATION_INTENT.update) {
    return {
      action: APP_ERROR_ACTION.update,
      code: APP_ERROR_CODE.skills.update.forbidden,
      requiredClaim,
    };
  }

  return {
    action: APP_ERROR_ACTION.create,
    code: APP_ERROR_CODE.skills.create.forbidden,
    requiredClaim,
  };
}
