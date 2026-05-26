import {
  buildUserFormValues,
  type UserFormState,
  type UserFormValues,
} from "~/domain/users/form";
import { USER_ROLE, buildUserRoleOptions, type UserRole } from "~/domain/users/model";
import { useT } from "~/shared/i18n/i18n-react";
import type {
  DashboardUsersMetrics as DashboardUsersPageMetrics,
  UserOverview,
} from "~/lib/users/users.server";
import {
  buildDashboardPaginationState,
  DASHBOARD_PAGINATION_DIRECTION,
  normalizeDashboardPaginationDirection,
  type DashboardPaginationDirection,
  type DashboardPaginationState,
} from "../shared/pagination";

type ValueOf<T> = T[keyof T];

export const DASHBOARD_USERS_QUERY_PARAM = {
  active: "active",
  cursor: "cursor",
  direction: "direction",
  edit: "edit",
  modal: "modal",
  role: "role",
  search: "search",
} as const;

export const DASHBOARD_USERS_MODAL = {
  create: "create",
  edit: "edit",
} as const;

export type DashboardUsersModalMode = ValueOf<typeof DASHBOARD_USERS_MODAL>;
export const DASHBOARD_USERS_PAGE_SIZE = 20;
export const DASHBOARD_USERS_ROLE_FILTER = {
  admin: USER_ROLE.admin,
  all: "all",
  author: USER_ROLE.author,
} as const;

export type DashboardUsersRoleFilter =
  (typeof DASHBOARD_USERS_ROLE_FILTER)[keyof typeof DASHBOARD_USERS_ROLE_FILTER];

export const DASHBOARD_USERS_ACTIVE_FILTER = {
  active: "active",
  all: "all",
  inactive: "inactive",
} as const;

export type DashboardUsersActiveFilter =
  (typeof DASHBOARD_USERS_ACTIVE_FILTER)[keyof typeof DASHBOARD_USERS_ACTIVE_FILTER];

export interface DashboardUsersMetrics {
  adminCount: number;
  authorCount: number;
  totalCount: number;
}

export interface DashboardUsersPermissions {
  canCreate: boolean;
  canDelete: boolean;
  canUpdate: boolean;
}

export interface DashboardUsersFormState {
  editingUserId: string | null;
  errors?: UserFormState["errors"];
  isOpen: boolean;
  mode: DashboardUsersModalMode | null;
  values: UserFormValues;
}

export interface DashboardUsersFilters {
  active: DashboardUsersActiveFilter;
  role: DashboardUsersRoleFilter;
  searchQuery: string;
}

export interface DashboardUsersGrantedLoaderData {
  access: "granted";
  filters: DashboardUsersFilters;
  form: DashboardUsersFormState;
  metrics: DashboardUsersMetrics;
  pagination: DashboardPaginationState;
  permissions: DashboardUsersPermissions;
  users: UserOverview[];
}

export interface DashboardUsersDeniedLoaderData {
  access: "denied";
}

export type DashboardUsersLoaderData =
  | DashboardUsersDeniedLoaderData
  | DashboardUsersGrantedLoaderData;

export interface DashboardUsersHrefParams {
  active?: DashboardUsersActiveFilter | null;
  cursor?: string | null;
  direction?: DashboardPaginationDirection | null;
  editId?: string | null;
  modal?: Extract<DashboardUsersModalMode, "create"> | null;
  role?: DashboardUsersRoleFilter | null;
  search?: string | null;
}

interface ResolveDashboardUsersFormArgs {
  editId: string | null;
  modal: string | null;
  users: UserOverview[];
}

interface BuildDashboardUsersFormStateArgs {
  editingUserId?: string | null;
  errors?: UserFormState["errors"];
  mode: DashboardUsersModalMode | null;
  values: UserFormValues;
}

export interface DashboardUsersViewState {
  active: DashboardUsersActiveFilter;
  cursor: string | null;
  direction: DashboardPaginationDirection;
  role: DashboardUsersRoleFilter;
  searchQuery: string;
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

function buildDashboardUsersFormState({
  editingUserId,
  errors,
  mode,
  values,
}: BuildDashboardUsersFormStateArgs): DashboardUsersFormState {
  return {
    editingUserId: editingUserId ?? null,
    errors,
    isOpen: mode !== null,
    mode,
    values,
  };
}

export function buildDashboardUsersHref(params: DashboardUsersHrefParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.search) {
    searchParams.set(DASHBOARD_USERS_QUERY_PARAM.search, params.search);
  }

  if (params.role && params.role !== DASHBOARD_USERS_ROLE_FILTER.all) {
    searchParams.set(DASHBOARD_USERS_QUERY_PARAM.role, params.role);
  }

  if (params.active && params.active !== DASHBOARD_USERS_ACTIVE_FILTER.all) {
    searchParams.set(DASHBOARD_USERS_QUERY_PARAM.active, params.active);
  }

  if (params.cursor) {
    searchParams.set(DASHBOARD_USERS_QUERY_PARAM.cursor, params.cursor);
  }

  if (
    params.direction &&
    (params.direction !== DASHBOARD_PAGINATION_DIRECTION.next || params.cursor)
  ) {
    searchParams.set(DASHBOARD_USERS_QUERY_PARAM.direction, params.direction);
  }

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
  metrics: DashboardUsersPageMetrics,
): DashboardUsersMetrics {
  return {
    adminCount: metrics.adminCount,
    authorCount: metrics.authorCount,
    totalCount: metrics.totalCount,
  };
}

export function buildDashboardUsersFilters(
  viewState: DashboardUsersViewState,
): DashboardUsersFilters {
  return {
    active: viewState.active,
    role: viewState.role,
    searchQuery: viewState.searchQuery,
  };
}

export function buildDashboardUsersPaginationState(args: {
  currentCursor: string | null;
  direction: DashboardPaginationDirection;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  nextCursor?: string | null;
  pageSize?: number;
  previousCursor?: string | null;
}): DashboardPaginationState {
  return buildDashboardPaginationState({
    currentCursor: args.currentCursor,
    direction: args.direction,
    hasNextPage: args.hasNextPage,
    hasPreviousPage: args.hasPreviousPage,
    nextCursor: args.nextCursor,
    pageSize: args.pageSize ?? DASHBOARD_USERS_PAGE_SIZE,
    previousCursor: args.previousCursor,
  });
}

export function normalizeDashboardUsersSearchQuery(value: string | null) {
  return value?.trim() ?? "";
}

export function normalizeDashboardUsersRoleFilter(
  value: string | null,
): DashboardUsersRoleFilter {
  return value === USER_ROLE.admin || value === USER_ROLE.author
    ? value
    : DASHBOARD_USERS_ROLE_FILTER.all;
}

export function normalizeDashboardUsersActiveFilter(
  value: string | null,
): DashboardUsersActiveFilter {
  return value === DASHBOARD_USERS_ACTIVE_FILTER.active ||
    value === DASHBOARD_USERS_ACTIVE_FILTER.inactive
    ? value
    : DASHBOARD_USERS_ACTIVE_FILTER.all;
}

export function buildDashboardUsersViewState(url: URL): DashboardUsersViewState {
  return {
    active: normalizeDashboardUsersActiveFilter(
      url.searchParams.get(DASHBOARD_USERS_QUERY_PARAM.active),
    ),
    cursor: url.searchParams.get(DASHBOARD_USERS_QUERY_PARAM.cursor),
    direction: normalizeDashboardPaginationDirection(
      url.searchParams.get(DASHBOARD_USERS_QUERY_PARAM.direction),
    ),
    role: normalizeDashboardUsersRoleFilter(
      url.searchParams.get(DASHBOARD_USERS_QUERY_PARAM.role),
    ),
    searchQuery: normalizeDashboardUsersSearchQuery(
      url.searchParams.get(DASHBOARD_USERS_QUERY_PARAM.search),
    ),
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

  return buildDashboardUsersFormState({
    editingUserId: editingUser?.id,
    mode,
    values: editingUser ? toUserFormValues(editingUser) : buildUserFormValues(),
  });
}

export function mergeDashboardUsersFormState(
  loaderForm: DashboardUsersFormState,
  actionData?: UserFormState,
): DashboardUsersFormState {
  if (!actionData) {
    return buildDashboardUsersFormState({
      editingUserId: loaderForm.editingUserId,
      mode: loaderForm.mode,
      values: loaderForm.values,
    });
  }

  return buildDashboardUsersFormState({
    editingUserId: loaderForm.editingUserId,
    errors: actionData.errors,
    mode: loaderForm.mode,
    values: actionData.values,
  });
}

export function useDashboardUserRoleOptions() {
  const t = useT();

  return buildUserRoleOptions(t);
}

export function useDashboardUserRoleFilterOptions() {
  const t = useT();

  return [
    {
      label: t("dashboard.users.filter.role.all"),
      value: DASHBOARD_USERS_ROLE_FILTER.all,
    },
    ...buildUserRoleOptions(t),
  ] as const;
}

export function useDashboardUserActiveFilterOptions() {
  const t = useT();

  return [
    {
      label: t("dashboard.users.filter.active.all"),
      value: DASHBOARD_USERS_ACTIVE_FILTER.all,
    },
    {
      label: t("common.active"),
      value: DASHBOARD_USERS_ACTIVE_FILTER.active,
    },
    {
      label: t("common.inactive"),
      value: DASHBOARD_USERS_ACTIVE_FILTER.inactive,
    },
  ] as const;
}
