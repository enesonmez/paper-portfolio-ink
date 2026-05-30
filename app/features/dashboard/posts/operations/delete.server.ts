import { redirect, type AppLoadContext } from "react-router";

import { POST_MUTATION_INTENT } from "~/domain/posts/model";

import type { getDbFromContext } from "../../../../../db/context";
import { deletePost } from "~/lib/posts/posts.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";
import { buildLocalizedPath } from "~/shared/i18n/i18n.shared";
import { recordAuditLog } from "~/shared/logging/audit.server";

import {
  revalidatePostCaches,
  throwMissingPostIdError,
  type DashboardPostsFormCopy,
} from "./_shared/support.server";

export async function handleDeletePostMutation(args: {
  context: AppLoadContext;
  db: ReturnType<typeof getDbFromContext>;
  formCopy: DashboardPostsFormCopy;
  locale: string;
  postId: string;
  request: Request;
  supportedLocaleCodes: string[];
}) {
  if (!args.postId) {
    throwMissingPostIdError({
      action: APP_ERROR_ACTION.delete,
      code: APP_ERROR_CODE.posts.delete.missingId,
      formMessage: args.formCopy.errors.deleteMissingPost,
    });
  }

  await deletePost(args.db, args.postId);
  await revalidatePostCaches(args.context, args.request);
  await recordAuditLog({
    action: APP_ERROR_ACTION.delete,
    context: args.context,
    details: {
      intent: POST_MUTATION_INTENT.delete,
    },
    message: "Post deleted",
    request: args.request,
    resource: APP_ERROR_RESOURCE.posts,
    result: "success",
    statusCode: 302,
    targetId: args.postId,
  });

  return redirect(
    buildLocalizedPath(args.locale, "/dashboard/posts", args.supportedLocaleCodes),
  );
}
