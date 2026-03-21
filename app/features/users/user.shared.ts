import { useT } from "~/features/i18n/i18n-react";
import type { I18nTranslator } from "~/features/i18n/i18n.shared";

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
  create: "create",
  delete: "delete",
  update: "update",
} as const;

export type UserMutationIntent = ValueOf<typeof USER_MUTATION_INTENT>;

export const USER_FORM_FIELD = {
  avatarUrl: "avatarUrl",
  bio: "bio",
  displayName: "displayName",
  email: "email",
  isActive: "isActive",
  intent: "intent",
  password: "password",
  role: "role",
  userId: "userId",
} as const;

export const DASHBOARD_USERS_QUERY_PARAM = {
  edit: "edit",
  modal: "modal",
} as const;

export const DASHBOARD_USERS_MODAL = {
  create: "create",
  edit: "edit",
} as const;

export type DashboardUsersModalMode = ValueOf<typeof DASHBOARD_USERS_MODAL>;
