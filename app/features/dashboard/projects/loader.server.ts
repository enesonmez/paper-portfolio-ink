import type { AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../db/context";
import { listProjects } from "~/lib/projects/projects.server";
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
  DASHBOARD_PROJECTS_QUERY_PARAM,
  buildDashboardProjectsMetrics,
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
      const projects = await listProjects(db);
      const url = new URL(request.url);

      return {
        access: "granted",
        form: resolveDashboardProjectsForm({
          editId: url.searchParams.get(DASHBOARD_PROJECTS_QUERY_PARAM.edit),
          modal: url.searchParams.get(DASHBOARD_PROJECTS_QUERY_PARAM.modal),
          projects,
        }),
        metrics: buildDashboardProjectsMetrics(projects),
        permissions: {
          canCreate: actorHasClaim(actor, AUTHORIZATION_CLAIM.projectsCreate),
          canDelete: actorHasClaim(actor, AUTHORIZATION_CLAIM.projectsDelete),
          canUpdate: actorHasClaim(actor, AUTHORIZATION_CLAIM.projectsUpdate),
        },
        projects,
      };
    },
  });
}
