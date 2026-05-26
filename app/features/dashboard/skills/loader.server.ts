import type { AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../db/context";
import {
  getSkillById,
  listSkillsPage,
  parseDashboardSkillsCursor,
} from "~/lib/skills/skills.server";
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
  DASHBOARD_SKILLS_PAGE_SIZE,
  DASHBOARD_SKILLS_QUERY_PARAM,
  buildDashboardSkillsFilters,
  buildDashboardSkillsMetrics,
  buildDashboardSkillsPaginationState,
  buildDashboardSkillsViewState,
  resolveDashboardSkillsForm,
  type DashboardSkillsLoaderData,
} from "./state";

export async function loadDashboardSkillsData(
  context: AppLoadContext,
  request: Request,
): Promise<DashboardSkillsLoaderData | Response> {
  return withDashboardAccess({
    authorize: ({ actor }) =>
      assertClaimAuthorized({
        actor,
        claim: AUTHORIZATION_CLAIM.skillsRead,
        error: {
          action: APP_ERROR_ACTION.read,
          code: APP_ERROR_CODE.skills.read.forbidden,
          message: "Skill dashboard access denied",
          resource: APP_ERROR_RESOURCE.skills,
          responseData: {
            access: "denied",
          } satisfies DashboardSkillsLoaderData,
          status: 403,
        },
      }),
    context,
    handle: async ({ actor }) => {
      const db = getDbFromContext(context);
      const url = new URL(request.url);
      const editId = url.searchParams.get(DASHBOARD_SKILLS_QUERY_PARAM.edit);
      const viewState = buildDashboardSkillsViewState(url);
      const [skillPage, editableSkill] = await Promise.all([
        listSkillsPage(db, {
          cursor: parseDashboardSkillsCursor(viewState.cursor),
          direction: viewState.direction,
          pageSize: DASHBOARD_SKILLS_PAGE_SIZE,
          searchQuery: viewState.searchQuery,
        }),
        editId ? getSkillById(db, editId) : Promise.resolve(null),
      ]);

      return {
        access: "granted",
        filters: buildDashboardSkillsFilters(viewState),
        form: resolveDashboardSkillsForm({
          editId,
          modal: url.searchParams.get(DASHBOARD_SKILLS_QUERY_PARAM.modal),
          skills: editableSkill ? [editableSkill] : [],
        }),
        metrics: buildDashboardSkillsMetrics(skillPage.totalCount),
        pagination: buildDashboardSkillsPaginationState({
          currentCursor: viewState.cursor,
          direction: viewState.direction,
          hasNextPage: skillPage.pagination.hasNextPage,
          hasPreviousPage: skillPage.pagination.hasPreviousPage,
          nextCursor: skillPage.pagination.nextCursor,
          pageSize: DASHBOARD_SKILLS_PAGE_SIZE,
          previousCursor: skillPage.pagination.previousCursor,
        }),
        permissions: {
          canCreate: actorHasClaim(actor, AUTHORIZATION_CLAIM.skillsCreate),
          canDelete: actorHasClaim(actor, AUTHORIZATION_CLAIM.skillsDelete),
          canUpdate: actorHasClaim(actor, AUTHORIZATION_CLAIM.skillsUpdate),
        },
        skills: skillPage.items,
      };
    },
    request,
  });
}
