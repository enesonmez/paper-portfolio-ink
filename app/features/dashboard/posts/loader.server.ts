import type { AppLoadContext } from "react-router";

import {
  actorHasAnyClaim,
  assertAuthorized,
  withDashboardAccess,
} from "~/shared/authz/authz.server";
import { AUTHORIZATION_CLAIM } from "~/shared/authz/model";
import {
  canAccessDashboardPosts,
  canCreatePosts,
  getAuthorizedEditablePost,
  listAuthorizedPosts,
} from "~/shared/authz/post-policy.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";

import {
  buildDeniedDashboardPostsLoaderData,
  buildDashboardPostsMetrics,
  resolveDashboardPostsForm,
  type DashboardPostsLoaderData,
} from "./state";

export async function loadDashboardPostsData(
  context: AppLoadContext,
  request: Request,
): Promise<DashboardPostsLoaderData | Response> {
  return withDashboardAccess({
    request,
    context,
    authorize: ({ actor }) =>
      assertAuthorized<DashboardPostsLoaderData>({
        error: {
          action: APP_ERROR_ACTION.read,
          code: APP_ERROR_CODE.posts.read.forbidden,
          message: "Post dashboard access denied",
          resource: APP_ERROR_RESOURCE.posts,
          responseData: buildDeniedDashboardPostsLoaderData(),
          status: 403,
        },
        isAllowed: canAccessDashboardPosts(actor),
      }),
    handle: async ({ actor }) => {
      const url = new URL(request.url);
      const editId = url.searchParams.get("edit");
      const [posts, editablePost] = await Promise.all([
        listAuthorizedPosts(context, actor),
        editId
          ? getAuthorizedEditablePost(context, actor, editId)
          : Promise.resolve(null),
      ]);

      return {
        access: "granted",
        form: resolveDashboardPostsForm({
          editablePost,
          editId,
          modal: url.searchParams.get("modal"),
        }),
        metrics: buildDashboardPostsMetrics(posts),
        permissions: {
          canCreate: canCreatePosts(actor),
          canDelete: actorHasAnyClaim(actor, [
            AUTHORIZATION_CLAIM.postsDeleteAny,
            AUTHORIZATION_CLAIM.postsDeleteOwn,
          ]),
          canUpdate: actorHasAnyClaim(actor, [
            AUTHORIZATION_CLAIM.postsUpdateAny,
            AUTHORIZATION_CLAIM.postsUpdateOwn,
          ]),
        },
        posts,
      };
    },
  });
}
