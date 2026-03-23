import { redirect, type AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../db/context";
import { buildPostFormValues, type PostFormState } from "~/domain/posts/form";
import { POST_MUTATION_INTENT } from "~/domain/posts/model";
import { purgePublicBlogDataCache } from "~/features/public/blog/server";
import type { parsePostFormData } from "~/lib/posts/post-form.server";
import {
  createPost,
  deletePost,
  findAvailablePostSlug,
  isPostSlugTaken,
  updatePost,
} from "~/lib/posts/posts.server";
import { isUniqueSlugConstraintError } from "~/lib/slug";
import {
  buildForbiddenFormState,
  type requireDashboardActor,
} from "~/shared/authz/authz.server";
import { canCreatePosts, canMutatePost } from "~/shared/authz/post-policy.server";
import {
  buildAuthorizationError,
  buildBusinessError,
  buildConflictError,
  buildValidationError,
} from "~/shared/errors/builders.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";
import { buildLocalizedPath, type createTranslator } from "~/shared/i18n/i18n.shared";
import { recordAuditLog } from "~/shared/logging/audit.server";

import type { buildDashboardPostsFormCopy } from "./copy";

type DashboardPostsAuth = Exclude<
  Awaited<ReturnType<typeof requireDashboardActor>>,
  Response
>;
type DashboardPostsFormCopy = ReturnType<typeof buildDashboardPostsFormCopy>;
type DashboardPostSubmission = ReturnType<typeof parsePostFormData>;

function buildPostActionValues(values: PostFormState["values"]) {
  return buildPostFormValues(values);
}

async function buildDuplicatePostSlugState(
  context: AppLoadContext,
  values: PostFormState["values"],
  duplicateMessage: string,
  postId?: string,
) {
  const db = getDbFromContext(context);

  return {
    errors: {
      slug: duplicateMessage,
    },
    slugSuggestion: await findAvailablePostSlug(db, values.title, postId),
    values: buildPostActionValues(values),
  } satisfies PostFormState;
}

async function ensureUniquePostSlug(args: {
  context: AppLoadContext;
  mode: typeof APP_ERROR_ACTION.create | typeof APP_ERROR_ACTION.update;
  postId?: string;
  submission: DashboardPostSubmission;
  t: ReturnType<typeof createTranslator>;
}) {
  if (
    await isPostSlugTaken(
      getDbFromContext(args.context),
      args.submission.slug,
      args.postId,
    )
  ) {
    await throwDuplicatePostSlugError(args);
  }
}

async function throwDuplicatePostSlugError(args: {
  context: AppLoadContext;
  mode: typeof APP_ERROR_ACTION.create | typeof APP_ERROR_ACTION.update;
  postId?: string;
  submission: DashboardPostSubmission;
  t: ReturnType<typeof createTranslator>;
}): Promise<never> {
  throw buildConflictError<PostFormState>({
    action: args.mode,
    code:
      args.mode === APP_ERROR_ACTION.update
        ? APP_ERROR_CODE.posts.update.duplicateSlug
        : APP_ERROR_CODE.posts.create.duplicateSlug,
    details: {
      postId: args.postId ?? null,
      slug: args.submission.slug,
    },
    message:
      args.mode === APP_ERROR_ACTION.update
        ? "Post update rejected because slug is already taken"
        : "Post creation rejected because slug is already taken",
    resource: APP_ERROR_RESOURCE.posts,
    responseData: await buildDuplicatePostSlugState(
      args.context,
      args.submission,
      args.t("validation.slug.taken"),
      args.postId,
    ),
    status: 409,
    targetId: args.postId ?? null,
    targetLabel: args.submission.title,
  });
}

export async function handleDeletePostMutation(args: {
  auth: DashboardPostsAuth;
  context: AppLoadContext;
  db: ReturnType<typeof getDbFromContext>;
  formCopy: DashboardPostsFormCopy;
  locale: string;
  postId: string;
  request: Request;
  supportedLocaleCodes: string[];
}) {
  if (!args.postId) {
    throw buildValidationError<PostFormState>({
      action: APP_ERROR_ACTION.delete,
      code: APP_ERROR_CODE.posts.delete.missingId,
      message: "Post delete action missing target identifier",
      resource: APP_ERROR_RESOURCE.posts,
      responseData: {
        errors: {
          form: args.formCopy.errors.deleteMissingPost,
        },
        values: buildPostFormValues(),
      },
    });
  }

  if (!(await canMutatePost(args.context, args.auth.actor, "delete", args.postId))) {
    throw buildAuthorizationError<PostFormState>({
      action: APP_ERROR_ACTION.delete,
      code: APP_ERROR_CODE.posts.delete.forbidden,
      details: {
        postId: args.postId,
      },
      message: "Post delete denied by authorization policy",
      resource: APP_ERROR_RESOURCE.posts,
      responseData: buildForbiddenFormState(
        args.formCopy.errors.forbidden,
        buildPostFormValues(),
      ),
      status: 403,
      targetId: args.postId,
    });
  }

  await deletePost(args.db, args.postId);
  await purgePublicBlogDataCache(args.context, args.request);
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

export async function handleUpdatePostMutation(args: {
  auth: DashboardPostsAuth;
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
    throw buildValidationError<PostFormState>({
      action: APP_ERROR_ACTION.update,
      code: APP_ERROR_CODE.posts.update.missingId,
      message: "Post update action missing target identifier",
      resource: APP_ERROR_RESOURCE.posts,
      responseData: {
        errors: {
          form: args.formCopy.errors.updateMissingPost,
        },
        values: buildPostActionValues(args.submission),
      },
    });
  }

  if (!(await canMutatePost(args.context, args.auth.actor, "update", args.postId))) {
    throw buildAuthorizationError<PostFormState>({
      action: APP_ERROR_ACTION.update,
      code: APP_ERROR_CODE.posts.update.forbidden,
      details: {
        postId: args.postId,
      },
      message: "Post update denied by authorization policy",
      resource: APP_ERROR_RESOURCE.posts,
      responseData: buildForbiddenFormState(
        args.formCopy.errors.forbidden,
        buildPostActionValues(args.submission),
      ),
      status: 403,
      targetId: args.postId,
      targetLabel: args.submission.title,
    });
  }

  await ensureUniquePostSlug({
    context: args.context,
    mode: APP_ERROR_ACTION.update,
    postId: args.postId,
    submission: args.submission,
    t: args.t,
  });

  try {
    await updatePost(args.db, args.postId, args.submission);
  } catch (error) {
    if (isUniqueSlugConstraintError(error, "posts")) {
      await throwDuplicatePostSlugError({
        context: args.context,
        mode: APP_ERROR_ACTION.update,
        postId: args.postId,
        submission: args.submission,
        t: args.t,
      });
    }

    throw error;
  }

  await purgePublicBlogDataCache(args.context, args.request);
  await recordAuditLog({
    action: APP_ERROR_ACTION.update,
    context: args.context,
    details: {
      intent: POST_MUTATION_INTENT.update,
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

export async function handleCreatePostMutation(args: {
  auth: DashboardPostsAuth;
  context: AppLoadContext;
  db: ReturnType<typeof getDbFromContext>;
  formCopy: DashboardPostsFormCopy;
  locale: string;
  request: Request;
  submission: DashboardPostSubmission;
  supportedLocaleCodes: string[];
  t: ReturnType<typeof createTranslator>;
}) {
  const authorId = args.auth.actor.userId;

  if (!canCreatePosts(args.auth.actor)) {
    throw buildAuthorizationError<PostFormState>({
      action: APP_ERROR_ACTION.create,
      code: APP_ERROR_CODE.posts.create.forbidden,
      message: "Post creation denied by authorization policy",
      resource: APP_ERROR_RESOURCE.posts,
      responseData: buildForbiddenFormState(
        args.formCopy.errors.forbidden,
        buildPostActionValues(args.submission),
      ),
      status: 403,
      targetLabel: args.submission.title,
    });
  }

  if (!authorId) {
    throw buildBusinessError<PostFormState>({
      action: APP_ERROR_ACTION.create,
      code: APP_ERROR_CODE.posts.create.missingAuthor,
      message: "Post creation requires an authenticated author identifier",
      resource: APP_ERROR_RESOURCE.posts,
      responseData: {
        errors: {
          form: args.formCopy.errors.missingAuthor,
        },
        values: buildPostActionValues(args.submission),
      },
      status: 400,
      targetLabel: args.submission.title,
    });
  }

  await ensureUniquePostSlug({
    context: args.context,
    mode: APP_ERROR_ACTION.create,
    submission: args.submission,
    t: args.t,
  });

  try {
    await createPost(args.db, authorId, args.submission);
  } catch (error) {
    if (isUniqueSlugConstraintError(error, "posts")) {
      await throwDuplicatePostSlugError({
        context: args.context,
        mode: APP_ERROR_ACTION.create,
        submission: args.submission,
        t: args.t,
      });
    }

    throw error;
  }

  await purgePublicBlogDataCache(args.context, args.request);
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
