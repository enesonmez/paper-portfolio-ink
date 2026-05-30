import { redirect, type AppLoadContext } from "react-router";

import type { PostFormState } from "~/domain/posts/form";
import { POST_MUTATION_INTENT } from "~/domain/posts/model";
import type { AuthorizationActor } from "~/shared/authz/authz.server";
import type { getDbFromContext } from "../../../../../db/context";
import { buildBusinessError } from "~/shared/errors/builders.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";
import { buildLocalizedPath, type createTranslator } from "~/shared/i18n/i18n.shared";
import { recordAuditLog } from "~/shared/logging/audit.server";
import { createPost } from "~/lib/posts/posts.server";

import {
  buildPostFormState,
  ensurePostSlugAvailableOrThrow,
  rethrowPostMutationConflict,
  revalidatePostCaches,
  type DashboardPostSubmission,
  type DashboardPostsFormCopy,
} from "./_shared/support.server";

export async function handleCreatePostMutation(args: {
  actor: AuthorizationActor;
  context: AppLoadContext;
  db: ReturnType<typeof getDbFromContext>;
  formCopy: DashboardPostsFormCopy;
  locale: string;
  request: Request;
  submission: DashboardPostSubmission;
  supportedLocaleCodes: string[];
  t: ReturnType<typeof createTranslator>;
}) {
  const authorId = args.actor.userId;

  if (!authorId) {
    throw buildBusinessError<PostFormState>({
      action: APP_ERROR_ACTION.create,
      code: APP_ERROR_CODE.posts.create.missingAuthor,
      message: "Post creation requires an authenticated author identifier",
      resource: APP_ERROR_RESOURCE.posts,
      responseData: buildPostFormState(
        {
          form: args.formCopy.errors.missingAuthor,
        },
        args.submission,
      ),
      status: 400,
      targetLabel: args.submission.title,
    });
  }

  await ensurePostSlugAvailableOrThrow({
    db: args.db,
    duplicateCode: APP_ERROR_CODE.posts.create.duplicateSlug,
    duplicateMessage: args.t("validation.slug.taken"),
    submission: args.submission,
  });

  try {
    await createPost(args.db, authorId, args.submission);
  } catch (error) {
    await rethrowPostMutationConflict(error, {
      db: args.db,
      duplicateCode: APP_ERROR_CODE.posts.create.duplicateSlug,
      duplicateMessage: args.t("validation.slug.taken"),
      submission: args.submission,
    });
  }

  await revalidatePostCaches(args.context, args.request);
  await recordAuditLog({
    action: APP_ERROR_ACTION.create,
    context: args.context,
    details: {
      intent: POST_MUTATION_INTENT.create,
      slug: args.submission.slug,
    },
    message: "Post created",
    request: args.request,
    resource: APP_ERROR_RESOURCE.posts,
    result: "success",
    statusCode: 302,
    targetId: authorId,
    targetLabel: args.submission.title,
  });

  return redirect(
    buildLocalizedPath(args.locale, "/dashboard/posts", args.supportedLocaleCodes),
  );
}
