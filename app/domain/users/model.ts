import { useT } from "~/shared/i18n/i18n-react";
import type { I18nTranslator } from "~/shared/i18n/i18n.shared";

type ValueOf<T> = T[keyof T];

export const USER_ROLE = {
  admin: "admin",
  author: "author",
} as const;

export type UserRole = ValueOf<typeof USER_ROLE>;

export const USER_ROLE_VALUES = [USER_ROLE.admin, USER_ROLE.author] as const;

export function buildUserRoleOptions(t: I18nTranslator) {
  return [
    {
      label: t("model.userRole.admin"),
      value: USER_ROLE.admin,
    },
    {
      label: t("model.userRole.author"),
      value: USER_ROLE.author,
    },
  ] as const;
}

export function useUserRoleOptions() {
  const t = useT();

  return buildUserRoleOptions(t);
}

export const USER_MUTATION_INTENT = {
  grantClaim: "grant-claim",
  create: "create",
  delete: "delete",
  revokeClaim: "revoke-claim",
  update: "update",
  updateAccessRole: "update-access-role",
} as const;

export type UserMutationIntent = ValueOf<typeof USER_MUTATION_INTENT>;

const userMutationIntentSet = new Set<string>(Object.values(USER_MUTATION_INTENT));

export function isUserMutationIntent(value: string): value is UserMutationIntent {
  return userMutationIntentSet.has(value);
}

export const USER_FORM_FIELD = {
  avatarUrl: "avatarUrl",
  authzVersion: "authzVersion",
  bio: "bio",
  claimKey: "claimKey",
  displayName: "displayName",
  email: "email",
  isActive: "isActive",
  intent: "intent",
  password: "password",
  role: "role",
  userId: "userId",
} as const;
