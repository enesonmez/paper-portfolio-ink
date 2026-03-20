type ValueOf<T> = T[keyof T];

export const USER_ROLE = {
  admin: "admin",
  author: "author",
} as const;

export type UserRole = ValueOf<typeof USER_ROLE>;

export const USER_ROLE_VALUES = [USER_ROLE.admin, USER_ROLE.author] as const;

export const USER_ROLE_OPTIONS = [
  {
    label: "Admin",
    value: USER_ROLE.admin,
  },
  {
    label: "Author",
    value: USER_ROLE.author,
  },
] as const;

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
