import type { AppLoadContext } from "react-router";

import { buildPostFormValues, type PostFormState } from "~/domain/posts/form";
import { POST_MUTATION_INTENT, type PostMutationIntent } from "~/domain/posts/model";
import {
  assertAuthorized,
  buildForbiddenFormState,
  type AuthorizationActor,
} from "~/shared/authz/authz.server";
import { canCreatePosts, canMutatePost } from "~/shared/authz/post-policy.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";

import type { DashboardPostSubmission, DashboardPostsFormCopy } from "./support.server";

function buildPostMutationValues(
  values?: DashboardPostSubmission,
): PostFormState["values"] {
  return buildPostFormValues(values ?? {});
}

export async function authorizePostMutationOrThrow(args: {
  actor: AuthorizationActor;
  context: AppLoadContext;
  formCopy: Pick<DashboardPostsFormCopy, "errors">;
  intent: PostMutationIntent;
  postId: string;
  values?: DashboardPostSubmission;
}) {
  if (args.intent === POST_MUTATION_INTENT.create) {
    assertAuthorized<PostFormState>({
      error: {
        action: APP_ERROR_ACTION.create,
        code: APP_ERROR_CODE.posts.create.forbidden,
        message: "Post creation denied by authorization policy",
        resource: APP_ERROR_RESOURCE.posts,
        responseData: buildForbiddenFormState(
          args.formCopy.errors.forbidden,
          buildPostMutationValues(args.values),
        ),
        status: 403,
        targetLabel: args.values?.title,
      },
      isAllowed: canCreatePosts(args.actor),
    });

    return;
  }

  if (!args.postId) {
    return;
  }

  const isUpdate = args.intent === POST_MUTATION_INTENT.update;
  const isAllowed = await canMutatePost(
    args.context,
    args.actor,
    isUpdate ? "update" : "delete",
    args.postId,
  );

  assertAuthorized<PostFormState>({
    error: {
      action: isUpdate ? APP_ERROR_ACTION.update : APP_ERROR_ACTION.delete,
      code: isUpdate
        ? APP_ERROR_CODE.posts.update.forbidden
        : APP_ERROR_CODE.posts.delete.forbidden,
      details: {
        postId: args.postId,
      },
      message: `Post ${isUpdate ? "update" : "delete"} denied by authorization policy`,
      resource: APP_ERROR_RESOURCE.posts,
      responseData: buildForbiddenFormState(
        args.formCopy.errors.forbidden,
        buildPostMutationValues(args.values),
      ),
      status: 403,
      targetId: args.postId,
      targetLabel: args.values?.title,
    },
    isAllowed,
  });
}
