import { actorHasClaim, type AuthorizationActor } from "~/shared/authz/authz.server";
import { AUTHORIZATION_CLAIM, type AuthorizationClaim } from "~/shared/authz/model";

import { DASHBOARD_RESOURCES_SECTION } from "../routing/href";
import type {
  DashboardResourcesPermissions,
  DashboardResourcesSectionPermissions,
} from "../state";

export type {
  DashboardResourcesPermissions,
  DashboardResourcesSectionPermissions,
} from "../state";

function buildResourceSectionPermissions(args: {
  actor: AuthorizationActor;
  createClaim: AuthorizationClaim;
  deleteClaim: AuthorizationClaim;
  readClaim: AuthorizationClaim;
  updateClaim: AuthorizationClaim;
}): DashboardResourcesSectionPermissions {
  return {
    canCreate: actorHasClaim(args.actor, args.createClaim),
    canDelete: actorHasClaim(args.actor, args.deleteClaim),
    canRead: actorHasClaim(args.actor, args.readClaim),
    canUpdate: actorHasClaim(args.actor, args.updateClaim),
  };
}

export function buildResourcesPermissions(
  actor: AuthorizationActor,
): DashboardResourcesPermissions {
  return {
    locales: buildResourceSectionPermissions({
      actor,
      createClaim: AUTHORIZATION_CLAIM.resourcesLocalesCreate,
      deleteClaim: AUTHORIZATION_CLAIM.resourcesLocalesDelete,
      readClaim: AUTHORIZATION_CLAIM.resourcesLocalesRead,
      updateClaim: AUTHORIZATION_CLAIM.resourcesLocalesUpdate,
    }),
    translations: buildResourceSectionPermissions({
      actor,
      createClaim: AUTHORIZATION_CLAIM.resourcesTranslationsCreate,
      deleteClaim: AUTHORIZATION_CLAIM.resourcesTranslationsDelete,
      readClaim: AUTHORIZATION_CLAIM.resourcesTranslationsRead,
      updateClaim: AUTHORIZATION_CLAIM.resourcesTranslationsUpdate,
    }),
  };
}

export function hasResourceReadAccess(permissions: DashboardResourcesPermissions) {
  return permissions.locales.canRead || permissions.translations.canRead;
}

export function canReadResourceSection(
  permissions: DashboardResourcesPermissions,
  section: "locales" | "translations",
) {
  return section === DASHBOARD_RESOURCES_SECTION.locales
    ? permissions.locales.canRead
    : permissions.translations.canRead;
}
