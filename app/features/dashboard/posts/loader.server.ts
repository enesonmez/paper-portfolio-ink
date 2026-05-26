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
  DASHBOARD_POSTS_PAGE_SIZE,
  DASHBOARD_POSTS_QUERY_PARAM,
  DASHBOARD_POSTS_STATUS_FILTER,
  buildDeniedDashboardPostsLoaderData,
  buildDashboardPostsFilters,
  buildDashboardPostsMetrics,
  buildDashboardPostsPaginationState,
  buildDashboardPostsViewState,
  resolveDashboardPostsForm,
  type DashboardPostsLoaderData,
} from "./state";
import { parseDashboardPostsCursor } from "~/lib/posts/posts.server";

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
      const viewState = buildDashboardPostsViewState(url);
      const [postPage, editablePost] = await Promise.all([
        listAuthorizedPosts(context, actor, {
          cursor: parseDashboardPostsCursor(viewState.cursor),
          direction: viewState.direction,
          pageSize: DASHBOARD_POSTS_PAGE_SIZE,
          searchQuery: viewState.searchQuery,
          status:
            viewState.status === DASHBOARD_POSTS_STATUS_FILTER.all
              ? undefined
              : viewState.status,
        }),
        editId
          ? getAuthorizedEditablePost(context, actor, editId)
          : Promise.resolve(null),
      ]);

      return {
        access: "granted",
        filters: buildDashboardPostsFilters(viewState),
        form: resolveDashboardPostsForm({
          editablePost,
          editId,
          modal: url.searchParams.get(DASHBOARD_POSTS_QUERY_PARAM.modal),
        }),
        metrics: buildDashboardPostsMetrics(postPage.metrics),
        pagination: buildDashboardPostsPaginationState({
          currentCursor: viewState.cursor,
          direction: viewState.direction,
          hasNextPage: postPage.pagination.hasNextPage,
          hasPreviousPage: postPage.pagination.hasPreviousPage,
          nextCursor: postPage.pagination.nextCursor,
          pageSize: DASHBOARD_POSTS_PAGE_SIZE,
          previousCursor: postPage.pagination.previousCursor,
        }),
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
        posts: postPage.items,
      };
    },
  });
}
