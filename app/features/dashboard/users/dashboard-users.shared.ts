import {
  buildUserFormValues,
  type UserFormState,
  type UserFormValues,
} from "~/features/users/user-form.shared";
import {
  DASHBOARD_USERS_MODAL,
  DASHBOARD_USERS_QUERY_PARAM,
  USER_ROLE,
  buildUserRoleOptions,
  type DashboardUsersModalMode,
  type UserRole,
} from "~/features/users/user.shared";
import { useT } from "~/shared/i18n/i18n-react";
import type { UserOverview } from "~/lib/users/users.server";

export interface DashboardUsersMetrics {
  adminCount: number;
  authorCount: number;
  totalCount: number;
}

export interface DashboardUsersFormState {
  editingUserId: string | null;
  errors?: UserFormState["errors"];
  isOpen: boolean;
  mode: DashboardUsersModalMode | null;
  values: UserFormValues;
}

export interface DashboardUsersGrantedLoaderData {
  access: "granted";
  form: DashboardUsersFormState;
  metrics: DashboardUsersMetrics;
  users: UserOverview[];
}

export interface DashboardUsersDeniedLoaderData {
  access: "denied";
}

export type DashboardUsersLoaderData =
  | DashboardUsersDeniedLoaderData
  | DashboardUsersGrantedLoaderData;

export interface DashboardUsersHrefParams {
  editId?: string | null;
  modal?: Extract<DashboardUsersModalMode, "create"> | null;
}

interface ResolveDashboardUsersFormArgs {
  editId: string | null;
  modal: string | null;
  users: UserOverview[];
}

function toUserFormValues(user: UserOverview): UserFormValues {
  return buildUserFormValues({
    avatarUrl: user.avatarUrl ?? "",
    bio: user.bio ?? "",
    displayName: user.displayName,
    email: user.email,
    isActive: user.isActive,
    password: "",
    role: user.role,
  });
}

export function buildDashboardUsersHref(params: DashboardUsersHrefParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.modal) {
    searchParams.set(DASHBOARD_USERS_QUERY_PARAM.modal, params.modal);
  }

  if (params.editId) {
    searchParams.set(DASHBOARD_USERS_QUERY_PARAM.edit, params.editId);
  }

  const search = searchParams.toString();

  return search ? `/dashboard/users?${search}` : "/dashboard/users";
}

export function buildDashboardUsersMetrics(
  users: UserOverview[],
): DashboardUsersMetrics {
  return {
    adminCount: users.filter((user) => user.role === USER_ROLE.admin && user.isActive)
      .length,
    authorCount: users.filter((user) => user.role === USER_ROLE.author && user.isActive)
      .length,
    totalCount: users.filter((user) => user.isActive).length,
  };
}

export function formatDashboardUserRole(role: UserRole) {
  return role.toUpperCase();
}

export function resolveDashboardUsersForm({
  editId,
  modal,
  users,
}: ResolveDashboardUsersFormArgs): DashboardUsersFormState {
  const editingUser = users.find((user) => user.id === editId);
  const mode =
    modal === DASHBOARD_USERS_MODAL.create
      ? DASHBOARD_USERS_MODAL.create
      : editingUser
        ? DASHBOARD_USERS_MODAL.edit
        : null;

  return {
    editingUserId: editingUser?.id ?? null,
    isOpen: mode !== null,
    mode,
    values: editingUser ? toUserFormValues(editingUser) : buildUserFormValues(),
  };
}

export function mergeDashboardUsersFormState(
  loaderForm: DashboardUsersFormState,
  actionData?: UserFormState,
): DashboardUsersFormState {
  if (!actionData) {
    return {
      ...loaderForm,
      errors: undefined,
    };
  }

  return {
    editingUserId: loaderForm.editingUserId,
    errors: actionData.errors,
    isOpen: loaderForm.isOpen,
    mode: loaderForm.mode,
    values: actionData.values,
  };
}

export function useDashboardUserRoleOptions() {
  const t = useT();

  return buildUserRoleOptions(t);
}
