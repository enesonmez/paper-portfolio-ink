import type { AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../db/context";
import {
  getProjectById,
  listProjectsPage,
  parseDashboardProjectsCursor,
} from "~/lib/projects/projects.server";
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
  DASHBOARD_PROJECTS_PAGE_SIZE,
  DASHBOARD_PROJECTS_QUERY_PARAM,
  DASHBOARD_PROJECTS_STATUS_FILTER,
  buildDashboardProjectsFilters,
  buildDashboardProjectsMetrics,
  buildDashboardProjectsPaginationState,
  buildDashboardProjectsViewState,
  resolveDashboardProjectsForm,
  type DashboardProjectsLoaderData,
} from "./state";

export async function loadDashboardProjectsData(
  context: AppLoadContext,
  request: Request,
): Promise<DashboardProjectsLoaderData | Response> {
  return withDashboardAccess({
    request,
    context,
    authorize: ({ actor }) =>
      assertClaimAuthorized({
        actor,
        claim: AUTHORIZATION_CLAIM.projectsRead,
        error: {
          action: APP_ERROR_ACTION.read,
          code: APP_ERROR_CODE.projects.read.forbidden,
          message: "Project dashboard access denied",
          resource: APP_ERROR_RESOURCE.projects,
          responseData: {
            access: "denied",
          } satisfies DashboardProjectsLoaderData,
          status: 403,
        },
      }),
    handle: async ({ actor }) => {
      const db = getDbFromContext(context);
      const url = new URL(request.url);
      const editId = url.searchParams.get(DASHBOARD_PROJECTS_QUERY_PARAM.edit);
      const viewState = buildDashboardProjectsViewState(url);
      const [projectPage, editableProject] = await Promise.all([
        listProjectsPage(db, {
          cursor: parseDashboardProjectsCursor(viewState.cursor),
          direction: viewState.direction,
          pageSize: DASHBOARD_PROJECTS_PAGE_SIZE,
          searchQuery: viewState.searchQuery,
          status:
            viewState.status === DASHBOARD_PROJECTS_STATUS_FILTER.all
              ? undefined
              : viewState.status,
        }),
        editId ? getProjectById(db, editId) : Promise.resolve(null),
      ]);

      return {
        access: "granted",
        filters: buildDashboardProjectsFilters(viewState),
        form: resolveDashboardProjectsForm({
          editId,
          modal: url.searchParams.get(DASHBOARD_PROJECTS_QUERY_PARAM.modal),
          projects: editableProject ? [editableProject] : [],
        }),
        metrics: buildDashboardProjectsMetrics(projectPage.metrics),
        pagination: buildDashboardProjectsPaginationState({
          currentCursor: viewState.cursor,
          direction: viewState.direction,
          hasNextPage: projectPage.pagination.hasNextPage,
          hasPreviousPage: projectPage.pagination.hasPreviousPage,
          nextCursor: projectPage.pagination.nextCursor,
          pageSize: DASHBOARD_PROJECTS_PAGE_SIZE,
          previousCursor: projectPage.pagination.previousCursor,
        }),
        permissions: {
          canCreate: actorHasClaim(actor, AUTHORIZATION_CLAIM.projectsCreate),
          canDelete: actorHasClaim(actor, AUTHORIZATION_CLAIM.projectsDelete),
          canUpdate: actorHasClaim(actor, AUTHORIZATION_CLAIM.projectsUpdate),
        },
        projects: projectPage.items,
      };
    },
  });
}
