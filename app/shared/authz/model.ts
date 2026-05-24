import { USER_ROLE, USER_ROLE_VALUES, type UserRole } from "~/domain/users/model";

type ValueOf<T> = T[keyof T];

export const AUTHORIZATION_SCOPE = {
  any: "any",
  global: "global",
  own: "own",
} as const;

export type AuthorizationScope = ValueOf<typeof AUTHORIZATION_SCOPE>;

export const AUTHORIZATION_EFFECT = {
  grant: "grant",
  revoke: "revoke",
} as const;

export type AuthorizationEffect = ValueOf<typeof AUTHORIZATION_EFFECT>;

export const AUTHORIZATION_CLAIM = {
  dashboardAccess: "dashboard.access",
  logsAuditDelete: "logs.audit.delete",
  logsAuditExport: "logs.audit.export",
  logsAuditRead: "logs.audit.read",
  logsErrorDelete: "logs.error.delete",
  logsErrorExport: "logs.error.export",
  logsErrorRead: "logs.error.read",
  postsCreate: "posts.create",
  postsDeleteAny: "posts.delete.any",
  postsDeleteOwn: "posts.delete.own",
  postsReadAny: "posts.read.any",
  postsReadOwn: "posts.read.own",
  postsUpdateAny: "posts.update.any",
  postsUpdateOwn: "posts.update.own",
  projectsCreate: "projects.create",
  projectsDelete: "projects.delete",
  projectsRead: "projects.read",
  projectsUpdate: "projects.update",
  resourcesLocalesCreate: "resources.locales.create",
  resourcesLocalesDelete: "resources.locales.delete",
  resourcesLocalesRead: "resources.locales.read",
  resourcesLocalesUpdate: "resources.locales.update",
  resourcesTranslationsCreate: "resources.translations.create",
  resourcesTranslationsDelete: "resources.translations.delete",
  resourcesTranslationsRead: "resources.translations.read",
  resourcesTranslationsUpdate: "resources.translations.update",
  settingsManage: "settings.manage",
  skillsCreate: "skills.create",
  skillsDelete: "skills.delete",
  skillsRead: "skills.read",
  skillsUpdate: "skills.update",
  usersCreate: "users.create",
  usersDelete: "users.delete",
  usersRead: "users.read",
  usersUpdate: "users.update",
} as const;

export type AuthorizationClaim = ValueOf<typeof AUTHORIZATION_CLAIM>;

export const AUTHORIZATION_CLAIM_VALUES = [
  AUTHORIZATION_CLAIM.dashboardAccess,
  AUTHORIZATION_CLAIM.logsAuditRead,
  AUTHORIZATION_CLAIM.logsAuditExport,
  AUTHORIZATION_CLAIM.logsAuditDelete,
  AUTHORIZATION_CLAIM.logsErrorRead,
  AUTHORIZATION_CLAIM.logsErrorExport,
  AUTHORIZATION_CLAIM.logsErrorDelete,
  AUTHORIZATION_CLAIM.postsReadOwn,
  AUTHORIZATION_CLAIM.postsReadAny,
  AUTHORIZATION_CLAIM.postsCreate,
  AUTHORIZATION_CLAIM.postsUpdateOwn,
  AUTHORIZATION_CLAIM.postsUpdateAny,
  AUTHORIZATION_CLAIM.postsDeleteOwn,
  AUTHORIZATION_CLAIM.postsDeleteAny,
  AUTHORIZATION_CLAIM.projectsRead,
  AUTHORIZATION_CLAIM.projectsCreate,
  AUTHORIZATION_CLAIM.projectsUpdate,
  AUTHORIZATION_CLAIM.projectsDelete,
  AUTHORIZATION_CLAIM.skillsRead,
  AUTHORIZATION_CLAIM.skillsCreate,
  AUTHORIZATION_CLAIM.skillsUpdate,
  AUTHORIZATION_CLAIM.skillsDelete,
  AUTHORIZATION_CLAIM.resourcesLocalesRead,
  AUTHORIZATION_CLAIM.resourcesLocalesCreate,
  AUTHORIZATION_CLAIM.resourcesLocalesUpdate,
  AUTHORIZATION_CLAIM.resourcesLocalesDelete,
  AUTHORIZATION_CLAIM.resourcesTranslationsRead,
  AUTHORIZATION_CLAIM.resourcesTranslationsCreate,
  AUTHORIZATION_CLAIM.resourcesTranslationsUpdate,
  AUTHORIZATION_CLAIM.resourcesTranslationsDelete,
  AUTHORIZATION_CLAIM.usersRead,
  AUTHORIZATION_CLAIM.usersCreate,
  AUTHORIZATION_CLAIM.usersUpdate,
  AUTHORIZATION_CLAIM.usersDelete,
  AUTHORIZATION_CLAIM.settingsManage,
] as const satisfies readonly AuthorizationClaim[];

export interface AuthorizationClaimDefinition {
  action: string;
  description: string;
  key: AuthorizationClaim;
  resource: string;
  scope: AuthorizationScope | null;
}

export const AUTHORIZATION_CLAIM_DEFINITIONS: readonly AuthorizationClaimDefinition[] =
  [
    {
      action: "access",
      description: "Allow entering the dashboard surface.",
      key: AUTHORIZATION_CLAIM.dashboardAccess,
      resource: "dashboard",
      scope: AUTHORIZATION_SCOPE.global,
    },
    {
      action: "read",
      description: "Read dashboard audit logs.",
      key: AUTHORIZATION_CLAIM.logsAuditRead,
      resource: "logs.audit",
      scope: AUTHORIZATION_SCOPE.global,
    },
    {
      action: "export",
      description: "Export dashboard audit logs.",
      key: AUTHORIZATION_CLAIM.logsAuditExport,
      resource: "logs.audit",
      scope: AUTHORIZATION_SCOPE.global,
    },
    {
      action: "delete",
      description: "Delete dashboard audit logs by range.",
      key: AUTHORIZATION_CLAIM.logsAuditDelete,
      resource: "logs.audit",
      scope: AUTHORIZATION_SCOPE.global,
    },
    {
      action: "read",
      description: "Read dashboard error logs.",
      key: AUTHORIZATION_CLAIM.logsErrorRead,
      resource: "logs.error",
      scope: AUTHORIZATION_SCOPE.global,
    },
    {
      action: "export",
      description: "Export dashboard error logs.",
      key: AUTHORIZATION_CLAIM.logsErrorExport,
      resource: "logs.error",
      scope: AUTHORIZATION_SCOPE.global,
    },
    {
      action: "delete",
      description: "Delete dashboard error logs by range.",
      key: AUTHORIZATION_CLAIM.logsErrorDelete,
      resource: "logs.error",
      scope: AUTHORIZATION_SCOPE.global,
    },
    {
      action: "read",
      description: "Read only the viewer's own posts.",
      key: AUTHORIZATION_CLAIM.postsReadOwn,
      resource: "posts",
      scope: AUTHORIZATION_SCOPE.own,
    },
    {
      action: "read",
      description: "Read every post in the dashboard registry.",
      key: AUTHORIZATION_CLAIM.postsReadAny,
      resource: "posts",
      scope: AUTHORIZATION_SCOPE.any,
    },
    {
      action: "create",
      description: "Create new posts.",
      key: AUTHORIZATION_CLAIM.postsCreate,
      resource: "posts",
      scope: AUTHORIZATION_SCOPE.own,
    },
    {
      action: "update",
      description: "Update only the viewer's own posts.",
      key: AUTHORIZATION_CLAIM.postsUpdateOwn,
      resource: "posts",
      scope: AUTHORIZATION_SCOPE.own,
    },
    {
      action: "update",
      description: "Update any post.",
      key: AUTHORIZATION_CLAIM.postsUpdateAny,
      resource: "posts",
      scope: AUTHORIZATION_SCOPE.any,
    },
    {
      action: "delete",
      description: "Delete only the viewer's own posts.",
      key: AUTHORIZATION_CLAIM.postsDeleteOwn,
      resource: "posts",
      scope: AUTHORIZATION_SCOPE.own,
    },
    {
      action: "delete",
      description: "Delete any post.",
      key: AUTHORIZATION_CLAIM.postsDeleteAny,
      resource: "posts",
      scope: AUTHORIZATION_SCOPE.any,
    },
    {
      action: "read",
      description: "Read the projects registry.",
      key: AUTHORIZATION_CLAIM.projectsRead,
      resource: "projects",
      scope: AUTHORIZATION_SCOPE.global,
    },
    {
      action: "create",
      description: "Create project records.",
      key: AUTHORIZATION_CLAIM.projectsCreate,
      resource: "projects",
      scope: AUTHORIZATION_SCOPE.global,
    },
    {
      action: "update",
      description: "Update project records.",
      key: AUTHORIZATION_CLAIM.projectsUpdate,
      resource: "projects",
      scope: AUTHORIZATION_SCOPE.global,
    },
    {
      action: "delete",
      description: "Delete project records.",
      key: AUTHORIZATION_CLAIM.projectsDelete,
      resource: "projects",
      scope: AUTHORIZATION_SCOPE.global,
    },
    {
      action: "read",
      description: "Read the skills registry.",
      key: AUTHORIZATION_CLAIM.skillsRead,
      resource: "skills",
      scope: AUTHORIZATION_SCOPE.global,
    },
    {
      action: "create",
      description: "Create skill records.",
      key: AUTHORIZATION_CLAIM.skillsCreate,
      resource: "skills",
      scope: AUTHORIZATION_SCOPE.global,
    },
    {
      action: "update",
      description: "Update skill records.",
      key: AUTHORIZATION_CLAIM.skillsUpdate,
      resource: "skills",
      scope: AUTHORIZATION_SCOPE.global,
    },
    {
      action: "delete",
      description: "Delete skill records.",
      key: AUTHORIZATION_CLAIM.skillsDelete,
      resource: "skills",
      scope: AUTHORIZATION_SCOPE.global,
    },
    {
      action: "read",
      description: "Read the locale registry.",
      key: AUTHORIZATION_CLAIM.resourcesLocalesRead,
      resource: "resources.locales",
      scope: AUTHORIZATION_SCOPE.global,
    },
    {
      action: "create",
      description: "Create locale records.",
      key: AUTHORIZATION_CLAIM.resourcesLocalesCreate,
      resource: "resources.locales",
      scope: AUTHORIZATION_SCOPE.global,
    },
    {
      action: "update",
      description: "Update locale records.",
      key: AUTHORIZATION_CLAIM.resourcesLocalesUpdate,
      resource: "resources.locales",
      scope: AUTHORIZATION_SCOPE.global,
    },
    {
      action: "delete",
      description: "Delete locale records.",
      key: AUTHORIZATION_CLAIM.resourcesLocalesDelete,
      resource: "resources.locales",
      scope: AUTHORIZATION_SCOPE.global,
    },
    {
      action: "read",
      description: "Read translation resources.",
      key: AUTHORIZATION_CLAIM.resourcesTranslationsRead,
      resource: "resources.translations",
      scope: AUTHORIZATION_SCOPE.global,
    },
    {
      action: "create",
      description: "Create translation resources.",
      key: AUTHORIZATION_CLAIM.resourcesTranslationsCreate,
      resource: "resources.translations",
      scope: AUTHORIZATION_SCOPE.global,
    },
    {
      action: "update",
      description: "Update translation resources.",
      key: AUTHORIZATION_CLAIM.resourcesTranslationsUpdate,
      resource: "resources.translations",
      scope: AUTHORIZATION_SCOPE.global,
    },
    {
      action: "delete",
      description: "Delete translation resources.",
      key: AUTHORIZATION_CLAIM.resourcesTranslationsDelete,
      resource: "resources.translations",
      scope: AUTHORIZATION_SCOPE.global,
    },
    {
      action: "read",
      description: "Read dashboard users.",
      key: AUTHORIZATION_CLAIM.usersRead,
      resource: "users",
      scope: AUTHORIZATION_SCOPE.global,
    },
    {
      action: "create",
      description: "Create dashboard users.",
      key: AUTHORIZATION_CLAIM.usersCreate,
      resource: "users",
      scope: AUTHORIZATION_SCOPE.global,
    },
    {
      action: "update",
      description: "Update dashboard users.",
      key: AUTHORIZATION_CLAIM.usersUpdate,
      resource: "users",
      scope: AUTHORIZATION_SCOPE.global,
    },
    {
      action: "delete",
      description: "Delete dashboard users.",
      key: AUTHORIZATION_CLAIM.usersDelete,
      resource: "users",
      scope: AUTHORIZATION_SCOPE.global,
    },
    {
      action: "manage",
      description: "Manage settings panels.",
      key: AUTHORIZATION_CLAIM.settingsManage,
      resource: "settings",
      scope: AUTHORIZATION_SCOPE.global,
    },
  ] as const;

export const DEFAULT_ROLE_CLAIMS: Record<UserRole, readonly AuthorizationClaim[]> = {
  [USER_ROLE.admin]: AUTHORIZATION_CLAIM_VALUES,
  [USER_ROLE.author]: [
    AUTHORIZATION_CLAIM.dashboardAccess,
    AUTHORIZATION_CLAIM.postsReadOwn,
    AUTHORIZATION_CLAIM.postsCreate,
    AUTHORIZATION_CLAIM.postsUpdateOwn,
    AUTHORIZATION_CLAIM.postsDeleteOwn,
  ],
};

export const PROJECTS_AUTHORIZATION_CLAIMS = [
  AUTHORIZATION_CLAIM.projectsRead,
  AUTHORIZATION_CLAIM.projectsCreate,
  AUTHORIZATION_CLAIM.projectsUpdate,
  AUTHORIZATION_CLAIM.projectsDelete,
] as const satisfies readonly AuthorizationClaim[];

export const LOGGING_AUTHORIZATION_CLAIMS = [
  AUTHORIZATION_CLAIM.logsAuditRead,
  AUTHORIZATION_CLAIM.logsAuditExport,
  AUTHORIZATION_CLAIM.logsAuditDelete,
  AUTHORIZATION_CLAIM.logsErrorRead,
  AUTHORIZATION_CLAIM.logsErrorExport,
  AUTHORIZATION_CLAIM.logsErrorDelete,
] as const satisfies readonly AuthorizationClaim[];

export const SKILLS_AUTHORIZATION_CLAIMS = [
  AUTHORIZATION_CLAIM.skillsRead,
  AUTHORIZATION_CLAIM.skillsCreate,
  AUTHORIZATION_CLAIM.skillsUpdate,
  AUTHORIZATION_CLAIM.skillsDelete,
] as const satisfies readonly AuthorizationClaim[];

export const USERS_AUTHORIZATION_CLAIMS = [
  AUTHORIZATION_CLAIM.usersRead,
  AUTHORIZATION_CLAIM.usersCreate,
  AUTHORIZATION_CLAIM.usersUpdate,
  AUTHORIZATION_CLAIM.usersDelete,
] as const satisfies readonly AuthorizationClaim[];

export const RESOURCE_LOCALES_AUTHORIZATION_CLAIMS = [
  AUTHORIZATION_CLAIM.resourcesLocalesRead,
  AUTHORIZATION_CLAIM.resourcesLocalesCreate,
  AUTHORIZATION_CLAIM.resourcesLocalesUpdate,
  AUTHORIZATION_CLAIM.resourcesLocalesDelete,
] as const satisfies readonly AuthorizationClaim[];

export const RESOURCE_TRANSLATIONS_AUTHORIZATION_CLAIMS = [
  AUTHORIZATION_CLAIM.resourcesTranslationsRead,
  AUTHORIZATION_CLAIM.resourcesTranslationsCreate,
  AUTHORIZATION_CLAIM.resourcesTranslationsUpdate,
  AUTHORIZATION_CLAIM.resourcesTranslationsDelete,
] as const satisfies readonly AuthorizationClaim[];

const authorizationClaimSet = new Set<string>(AUTHORIZATION_CLAIM_VALUES);
const userRoleSet = new Set<string>(USER_ROLE_VALUES);

export function isAuthorizationClaim(value: string): value is AuthorizationClaim {
  return authorizationClaimSet.has(value);
}

export function isAuthorizationEffect(value: string): value is AuthorizationEffect {
  return value === AUTHORIZATION_EFFECT.grant || value === AUTHORIZATION_EFFECT.revoke;
}

export function isUserRole(value: string): value is UserRole {
  return userRoleSet.has(value);
}

export function getDefaultClaimsForRole(role: UserRole): readonly AuthorizationClaim[] {
  return DEFAULT_ROLE_CLAIMS[role];
}

export function hasAuthorizationClaim(
  claims: readonly AuthorizationClaim[],
  claim: AuthorizationClaim,
) {
  return claims.includes(claim);
}

export function hasAnyAuthorizationClaim(
  claims: readonly AuthorizationClaim[],
  requiredClaims: readonly AuthorizationClaim[],
) {
  return requiredClaims.some((claim) => claims.includes(claim));
}
