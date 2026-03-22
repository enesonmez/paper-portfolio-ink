import { hasAnyAuthorizationClaim, type AuthorizationClaim } from "./model";
import type { AuthorizationActor } from "./actor";

export function actorHasClaim(actor: AuthorizationActor, claim: AuthorizationClaim) {
  return actor.claims.includes(claim);
}

export function actorHasAnyClaim(
  actor: AuthorizationActor,
  claims: readonly AuthorizationClaim[],
) {
  return hasAnyAuthorizationClaim(actor.claims, claims);
}

export function denyLoaderIfMissingClaim<T>(
  actor: AuthorizationActor,
  claim: AuthorizationClaim,
  deniedState: T,
) {
  if (!actorHasClaim(actor, claim)) {
    return deniedState;
  }

  return null;
}

export function denyActionIfMissingClaim<T>(
  actor: AuthorizationActor,
  claim: AuthorizationClaim,
  forbiddenState: T,
) {
  if (!actorHasClaim(actor, claim)) {
    return forbiddenState;
  }

  return null;
}
