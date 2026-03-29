import type { AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../db/context";
import { listUsers } from "~/lib/users/users.server";
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
  buildDashboardUsersMetrics,
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
      const users = await listUsers(db);
      const url = new URL(request.url);

      return {
        access: "granted",
        form: resolveDashboardUsersForm({
          editId: url.searchParams.get("edit"),
          modal: url.searchParams.get("modal"),
          users,
        }),
        metrics: buildDashboardUsersMetrics(users),
        permissions: {
          canCreate: actorHasClaim(actor, AUTHORIZATION_CLAIM.usersCreate),
          canDelete: actorHasClaim(actor, AUTHORIZATION_CLAIM.usersDelete),
          canUpdate: actorHasClaim(actor, AUTHORIZATION_CLAIM.usersUpdate),
        },
        users,
      };
    },
  });
}
