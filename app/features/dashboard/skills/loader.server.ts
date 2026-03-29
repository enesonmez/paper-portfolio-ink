import type { AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../db/context";
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
import { listSkills } from "~/lib/skills/skills.server";

import {
  buildDashboardSkillsMetrics,
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
      const skillRows = await listSkills(db);
      const url = new URL(request.url);

      return {
        access: "granted",
        form: resolveDashboardSkillsForm({
          editId: url.searchParams.get("edit"),
          modal: url.searchParams.get("modal"),
          skills: skillRows,
        }),
        metrics: buildDashboardSkillsMetrics(skillRows),
        permissions: {
          canCreate: actorHasClaim(actor, AUTHORIZATION_CLAIM.skillsCreate),
          canDelete: actorHasClaim(actor, AUTHORIZATION_CLAIM.skillsDelete),
          canUpdate: actorHasClaim(actor, AUTHORIZATION_CLAIM.skillsUpdate),
        },
        skills: skillRows,
      };
    },
    request,
  });
}
