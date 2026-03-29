import { redirect, type AppLoadContext } from "react-router";

import type { getDbFromContext } from "../../../../../db/context";
import { updatePost } from "~/lib/posts/posts.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";
import { buildLocalizedPath, type createTranslator } from "~/shared/i18n/i18n.shared";
import { recordAuditLog } from "~/shared/logging/audit.server";

import {
  ensurePostSlugAvailableOrThrow,
  rethrowPostMutationConflict,
  revalidatePostCaches,
  throwMissingPostIdError,
  type DashboardPostSubmission,
  type DashboardPostsFormCopy,
} from "./_shared/support.server";

export async function handleUpdatePostMutation(args: {
  context: AppLoadContext;
  db: ReturnType<typeof getDbFromContext>;
  formCopy: DashboardPostsFormCopy;
  locale: string;
  postId: string;
  request: Request;
  submission: DashboardPostSubmission;
  supportedLocaleCodes: string[];
  t: ReturnType<typeof createTranslator>;
}) {
  if (!args.postId) {
    throwMissingPostIdError({
      action: APP_ERROR_ACTION.update,
      code: APP_ERROR_CODE.posts.update.missingId,
      formMessage: args.formCopy.errors.updateMissingPost,
      values: args.submission,
    });
  }

  await ensurePostSlugAvailableOrThrow({
    db: args.db,
    duplicateCode: APP_ERROR_CODE.posts.update.duplicateSlug,
    duplicateMessage: args.t("validation.slug.taken"),
    postId: args.postId,
    submission: args.submission,
  });

  try {
    await updatePost(args.db, args.postId, args.submission);
  } catch (error) {
    await rethrowPostMutationConflict(error, {
      db: args.db,
      duplicateCode: APP_ERROR_CODE.posts.update.duplicateSlug,
      duplicateMessage: args.t("validation.slug.taken"),
      postId: args.postId,
      submission: args.submission,
    });
  }

  await revalidatePostCaches(args.context, args.request);
  await recordAuditLog({
    action: APP_ERROR_ACTION.update,
    context: args.context,
    details: {
      intent: "update",
      slug: args.submission.slug,
    },
    message: "Post updated",
    request: args.request,
    resource: APP_ERROR_RESOURCE.posts,
    result: "success",
    statusCode: 302,
    targetId: args.postId,
    targetLabel: args.submission.title,
  });

  return redirect(
    buildLocalizedPath(args.locale, "/dashboard/posts", args.supportedLocaleCodes),
  );
}
