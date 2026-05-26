import {
  buildUserAuthorizationFormValues,
  buildUserFormValues,
  type UserAuthorizationFormState,
  type UserAuthorizationFormValues,
  type UserFormState,
  type UserFormValues,
} from "~/domain/users/form";
import { USER_ROLE, buildUserRoleOptions, type UserRole } from "~/domain/users/model";
import type {
  DashboardUsersMetrics as DashboardUsersPageMetrics,
  UserAuthorizationRecord,
  UserOverview,
} from "~/lib/users/users.server";
import {
  AUTHORIZATION_CLAIM_DEFINITIONS,
  getDefaultClaimsForRole,
  type AuthorizationClaim,
  type AuthorizationEffect,
} from "~/shared/authz/model";
import { useT } from "~/shared/i18n/i18n-react";

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
  access: "access",
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

export interface DashboardUsersProfileFormState {
  editingUserId: string | null;
  errors?: UserFormState["errors"];
  isOpen: boolean;
  mode: Extract<DashboardUsersModalMode, "create" | "edit"> | null;
  values: UserFormValues;
}

export interface DashboardUsersAuthorizationClaimState {
  action: string;
  claimKey: AuthorizationClaim;
  description: string;
  effect: AuthorizationEffect | null;
  isEffective: boolean;
  isRoleGranted: boolean;
  resource: string;
  scope: string | null;
}

export interface DashboardUsersAuthorizationFormState {
  authzVersion: number | null;
  claims: DashboardUsersAuthorizationClaimState[];
  editingUserEmail: string;
  editingUserId: string | null;
  editingUserName: string;
  errors?: UserAuthorizationFormState["errors"];
  isOpen: boolean;
  isUserActive: boolean;
  mode: Extract<DashboardUsersModalMode, "access"> | null;
  values: UserAuthorizationFormValues;
}

export interface DashboardUsersFilters {
  active: DashboardUsersActiveFilter;
  role: DashboardUsersRoleFilter;
  searchQuery: string;
}

export interface DashboardUsersGrantedLoaderData {
  access: "granted";
  authorizationForm: DashboardUsersAuthorizationFormState;
  filters: DashboardUsersFilters;
  metrics: DashboardUsersMetrics;
  pagination: DashboardPaginationState;
  permissions: DashboardUsersPermissions;
  profileForm: DashboardUsersProfileFormState;
  users: UserOverview[];
}

export interface DashboardUsersDeniedLoaderData {
  access: "denied";
}

export type DashboardUsersLoaderData =
  | DashboardUsersDeniedLoaderData
  | DashboardUsersGrantedLoaderData;

export interface DashboardUsersActionState {
  actionError?: string;
  authorizationForm?: Pick<
    DashboardUsersAuthorizationFormState,
    "editingUserId" | "errors" | "isOpen" | "mode" | "values"
  >;
  profileForm?: Pick<
    DashboardUsersProfileFormState,
    "editingUserId" | "errors" | "isOpen" | "mode" | "values"
  >;
}

export interface DashboardUsersHrefParams {
  active?: DashboardUsersActiveFilter | null;
  cursor?: string | null;
  direction?: DashboardPaginationDirection | null;
  editId?: string | null;
  modal?: DashboardUsersModalMode | null;
  role?: DashboardUsersRoleFilter | null;
  search?: string | null;
}

interface ResolveDashboardUsersProfileFormArgs {
  editId: string | null;
  modal: string | null;
  users: UserOverview[];
}

interface ResolveDashboardUsersAuthorizationFormArgs {
  authorizationUser: UserAuthorizationRecord | null;
  modal: string | null;
}

interface BuildDashboardUsersProfileFormStateArgs {
  editingUserId?: string | null;
  errors?: UserFormState["errors"];
  mode: DashboardUsersProfileFormState["mode"];
  values: UserFormValues;
}

interface BuildDashboardUsersAuthorizationFormStateArgs {
  authzVersion?: number | null;
  claims?: DashboardUsersAuthorizationClaimState[];
  editingUserEmail?: string;
  editingUserId?: string | null;
  editingUserName?: string;
  errors?: UserAuthorizationFormState["errors"];
  isUserActive?: boolean;
  mode: DashboardUsersAuthorizationFormState["mode"];
  values: UserAuthorizationFormValues;
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

function buildDashboardUsersProfileFormState({
  editingUserId,
  errors,
  mode,
  values,
}: BuildDashboardUsersProfileFormStateArgs): DashboardUsersProfileFormState {
  return {
    editingUserId: editingUserId ?? null,
    errors,
    isOpen: mode !== null,
    mode,
    values,
  };
}

function buildDashboardUsersAuthorizationClaims(
  user: UserAuthorizationRecord,
): DashboardUsersAuthorizationClaimState[] {
  const roleClaims = new Set(getDefaultClaimsForRole(user.role));
  const overrideMap = new Map(
    user.overrides.map((override) => [override.claimKey, override.effect]),
  );

  return AUTHORIZATION_CLAIM_DEFINITIONS.map((definition) => {
    const effect = overrideMap.get(definition.key) ?? null;
    const isRoleGranted = roleClaims.has(definition.key);
    const isEffective =
      effect === "grant" ? true : effect === "revoke" ? false : isRoleGranted;

    return {
      action: definition.action,
      claimKey: definition.key,
      description: definition.description,
      effect,
      isEffective,
      isRoleGranted,
      resource: definition.resource,
      scope: definition.scope,
    };
  });
}

function buildDashboardUsersAuthorizationFormState({
  authzVersion,
  claims,
  editingUserEmail,
  editingUserId,
  editingUserName,
  errors,
  isUserActive,
  mode,
  values,
}: BuildDashboardUsersAuthorizationFormStateArgs): DashboardUsersAuthorizationFormState {
  return {
    authzVersion: authzVersion ?? null,
    claims: claims ?? [],
    editingUserEmail: editingUserEmail ?? "",
    editingUserId: editingUserId ?? null,
    editingUserName: editingUserName ?? "",
    errors,
    isOpen: mode !== null,
    isUserActive: isUserActive ?? true,
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

export function resolveDashboardUsersProfileForm({
  editId,
  modal,
  users,
}: ResolveDashboardUsersProfileFormArgs): DashboardUsersProfileFormState {
  const editingUser = users.find((user) => user.id === editId);
  const mode =
    modal === DASHBOARD_USERS_MODAL.create
      ? DASHBOARD_USERS_MODAL.create
      : modal === DASHBOARD_USERS_MODAL.edit && editingUser
        ? DASHBOARD_USERS_MODAL.edit
        : null;

  return buildDashboardUsersProfileFormState({
    editingUserId: editingUser?.id,
    mode,
    values: editingUser ? toUserFormValues(editingUser) : buildUserFormValues(),
  });
}

export function resolveDashboardUsersAuthorizationForm({
  authorizationUser,
  modal,
}: ResolveDashboardUsersAuthorizationFormArgs): DashboardUsersAuthorizationFormState {
  if (modal !== DASHBOARD_USERS_MODAL.access || !authorizationUser) {
    return buildDashboardUsersAuthorizationFormState({
      mode: null,
      values: buildUserAuthorizationFormValues(),
    });
  }

  return buildDashboardUsersAuthorizationFormState({
    authzVersion: authorizationUser.authzVersion,
    claims: buildDashboardUsersAuthorizationClaims(authorizationUser),
    editingUserEmail: authorizationUser.email,
    editingUserId: authorizationUser.id,
    editingUserName: authorizationUser.displayName,
    isUserActive: authorizationUser.isActive,
    mode: DASHBOARD_USERS_MODAL.access,
    values: buildUserAuthorizationFormValues({
      authzVersion: authorizationUser.authzVersion.toString(),
      role: authorizationUser.role,
    }),
  });
}

export function mergeDashboardUsersProfileFormState(
  loaderForm: DashboardUsersProfileFormState,
  actionData?: DashboardUsersActionState,
): DashboardUsersProfileFormState {
  if (!actionData?.profileForm) {
    return loaderForm;
  }

  return buildDashboardUsersProfileFormState({
    editingUserId: actionData.profileForm.editingUserId,
    errors: actionData.profileForm.errors,
    mode: actionData.profileForm.mode,
    values: actionData.profileForm.values,
  });
}

export function mergeDashboardUsersAuthorizationFormState(
  loaderForm: DashboardUsersAuthorizationFormState,
  actionData?: DashboardUsersActionState,
): DashboardUsersAuthorizationFormState {
  if (!actionData?.authorizationForm) {
    return loaderForm;
  }

  return buildDashboardUsersAuthorizationFormState({
    authzVersion: loaderForm.authzVersion,
    claims: loaderForm.claims,
    editingUserEmail: loaderForm.editingUserEmail,
    editingUserId: actionData.authorizationForm.editingUserId,
    editingUserName: loaderForm.editingUserName,
    errors: actionData.authorizationForm.errors,
    isUserActive: loaderForm.isUserActive,
    mode: actionData.authorizationForm.mode,
    values: actionData.authorizationForm.values,
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
