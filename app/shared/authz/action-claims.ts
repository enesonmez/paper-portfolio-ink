import {
  LOGGING_MUTATION_INTENT,
  type LoggingMutationIntent,
} from "~/domain/logging/model";
import {
  PROJECT_MUTATION_INTENT,
  type ProjectMutationIntent,
} from "~/domain/projects/model";
import {
  RESOURCE_MUTATION_INTENT,
  type ResourceMutationIntent,
} from "~/domain/resources/contract";
import { SKILL_MUTATION_INTENT, type SkillMutationIntent } from "~/domain/skills/model";
import { USER_MUTATION_INTENT, type UserMutationIntent } from "~/domain/users/model";

import { AUTHORIZATION_CLAIM, type AuthorizationClaim } from "./model";

type MutationClaimMap = Readonly<Record<string, AuthorizationClaim>>;

export const LOGGING_MUTATION_CLAIMS = {
  [LOGGING_MUTATION_INTENT.deleteErrors]: AUTHORIZATION_CLAIM.logsDelete,
  [LOGGING_MUTATION_INTENT.exportErrors]: AUTHORIZATION_CLAIM.logsExport,
} as const satisfies Record<LoggingMutationIntent, AuthorizationClaim>;

export const PROJECT_MUTATION_CLAIMS = {
  [PROJECT_MUTATION_INTENT.create]: AUTHORIZATION_CLAIM.projectsCreate,
  [PROJECT_MUTATION_INTENT.delete]: AUTHORIZATION_CLAIM.projectsDelete,
  [PROJECT_MUTATION_INTENT.update]: AUTHORIZATION_CLAIM.projectsUpdate,
} as const satisfies Record<ProjectMutationIntent, AuthorizationClaim>;

export const SKILL_MUTATION_CLAIMS = {
  [SKILL_MUTATION_INTENT.create]: AUTHORIZATION_CLAIM.skillsCreate,
  [SKILL_MUTATION_INTENT.delete]: AUTHORIZATION_CLAIM.skillsDelete,
  [SKILL_MUTATION_INTENT.update]: AUTHORIZATION_CLAIM.skillsUpdate,
} as const satisfies Record<SkillMutationIntent, AuthorizationClaim>;

export const USER_MUTATION_CLAIMS = {
  [USER_MUTATION_INTENT.create]: AUTHORIZATION_CLAIM.usersCreate,
  [USER_MUTATION_INTENT.delete]: AUTHORIZATION_CLAIM.usersDelete,
  [USER_MUTATION_INTENT.update]: AUTHORIZATION_CLAIM.usersUpdate,
} as const satisfies Record<UserMutationIntent, AuthorizationClaim>;

export const RESOURCE_MUTATION_CLAIMS = {
  [RESOURCE_MUTATION_INTENT.createLocale]: AUTHORIZATION_CLAIM.resourcesLocalesCreate,
  [RESOURCE_MUTATION_INTENT.deleteLocale]: AUTHORIZATION_CLAIM.resourcesLocalesDelete,
  [RESOURCE_MUTATION_INTENT.updateLocale]: AUTHORIZATION_CLAIM.resourcesLocalesUpdate,
  [RESOURCE_MUTATION_INTENT.createTranslation]:
    AUTHORIZATION_CLAIM.resourcesTranslationsCreate,
  [RESOURCE_MUTATION_INTENT.deleteTranslation]:
    AUTHORIZATION_CLAIM.resourcesTranslationsDelete,
  [RESOURCE_MUTATION_INTENT.updateTranslation]:
    AUTHORIZATION_CLAIM.resourcesTranslationsUpdate,
} as const satisfies Record<ResourceMutationIntent, AuthorizationClaim>;

export function resolveMutationClaim(
  intent: string,
  claims: MutationClaimMap,
  fallbackClaim: AuthorizationClaim,
) {
  return claims[intent] ?? fallbackClaim;
}
