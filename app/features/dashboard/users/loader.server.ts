import type { AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../db/context";
import {
  getUserOverviewById,
  listUsersPage,
  parseDashboardUsersCursor,
} from "~/lib/users/users.server";
import {
  actorHasClaim,
  assertClaimAuthorized,
  withDashboardAccess,
} from "~/shared/authz/authz.server";
import { AUTHORIZATION_CLAIM } from "~/shared/authz/model";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";

import {
  DASHBOARD_USERS_ACTIVE_FILTER,
  DASHBOARD_USERS_PAGE_SIZE,
  DASHBOARD_USERS_QUERY_PARAM,
  DASHBOARD_USERS_ROLE_FILTER,
  buildDashboardUsersFilters,
  buildDashboardUsersMetrics,
  buildDashboardUsersPaginationState,
  buildDashboardUsersViewState,
  resolveDashboardUsersForm,
  type DashboardUsersLoaderData,
} from "./state";

export async function loadDashboardUsersData(
  context: AppLoadContext,
  request: Request,
): Promise<DashboardUsersLoaderData | Response> {
  return withDashboardAccess({
    request,
    context,
    authorize: ({ actor }) =>
      assertClaimAuthorized({
        actor,
        claim: AUTHORIZATION_CLAIM.usersRead,
        error: {
          action: APP_ERROR_ACTION.read,
          code: APP_ERROR_CODE.users.read.forbidden,
          message: "User dashboard access denied",
          resource: APP_ERROR_RESOURCE.users,
          responseData: {
            access: "denied",
          } satisfies DashboardUsersLoaderData,
          status: 403,
        },
      }),
    handle: async ({ actor }) => {
      const db = getDbFromContext(context);
      const url = new URL(request.url);
      const editId = url.searchParams.get(DASHBOARD_USERS_QUERY_PARAM.edit);
      const viewState = buildDashboardUsersViewState(url);
      const [userPage, editableUser] = await Promise.all([
        listUsersPage(db, {
          active:
            viewState.active === DASHBOARD_USERS_ACTIVE_FILTER.all
              ? undefined
              : viewState.active === DASHBOARD_USERS_ACTIVE_FILTER.active,
          cursor: parseDashboardUsersCursor(viewState.cursor),
          direction: viewState.direction,
          pageSize: DASHBOARD_USERS_PAGE_SIZE,
          role:
            viewState.role === DASHBOARD_USERS_ROLE_FILTER.all
              ? undefined
              : viewState.role,
          searchQuery: viewState.searchQuery,
        }),
        editId ? getUserOverviewById(db, editId) : Promise.resolve(null),
      ]);

      return {
        access: "granted",
        filters: buildDashboardUsersFilters(viewState),
        form: resolveDashboardUsersForm({
          editId,
          modal: url.searchParams.get(DASHBOARD_USERS_QUERY_PARAM.modal),
          users: editableUser ? [editableUser] : [],
        }),
        metrics: buildDashboardUsersMetrics(userPage.metrics),
        pagination: buildDashboardUsersPaginationState({
          currentCursor: viewState.cursor,
          direction: viewState.direction,
          hasNextPage: userPage.pagination.hasNextPage,
          hasPreviousPage: userPage.pagination.hasPreviousPage,
          nextCursor: userPage.pagination.nextCursor,
          pageSize: DASHBOARD_USERS_PAGE_SIZE,
          previousCursor: userPage.pagination.previousCursor,
        }),
        permissions: {
          canCreate: actorHasClaim(actor, AUTHORIZATION_CLAIM.usersCreate),
          canDelete: actorHasClaim(actor, AUTHORIZATION_CLAIM.usersDelete),
          canUpdate: actorHasClaim(actor, AUTHORIZATION_CLAIM.usersUpdate),
        },
        users: userPage.items,
      };
    },
  });
}
