import type { AppLoadContext } from "react-router";

import type { DashboardActorSession } from "~/shared/authz/authz.server";
import type { getDbFromContext } from "../../../../../../db/context";
import { buildPostFormValues, type PostFormState } from "~/domain/posts/form";
import { purgePublicBlogDataCache } from "~/features/public/blog/server";
import type { parsePostFormData } from "~/lib/posts/post-form.server";
import { findAvailablePostSlug, isPostSlugTaken } from "~/lib/posts/posts.server";
import { isUniqueSlugConstraintError } from "~/lib/slug";
import {
  buildConflictError,
  buildValidationError,
} from "~/shared/errors/builders.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_RESOURCE,
  type AppErrorCode,
} from "~/shared/errors/contracts";

import type { buildDashboardPostsFormCopy } from "../../copy";

export type DashboardPostsAuth = DashboardActorSession;
export type DashboardPostsFormCopy = ReturnType<typeof buildDashboardPostsFormCopy>;
export type DashboardPostSubmission = ReturnType<typeof parsePostFormData>;

export function buildPostFormState(
  errors: PostFormState["errors"],
  values?: PostFormState["values"],
  slugSuggestion?: string | null,
) {
  return {
    errors,
    slugSuggestion: slugSuggestion ?? null,
    values: values ? buildPostFormValues(values) : buildPostFormValues(),
  } satisfies PostFormState;
}

export function throwMissingPostIdError(args: {
  action: typeof APP_ERROR_ACTION.delete | typeof APP_ERROR_ACTION.update;
  code: AppErrorCode;
  formMessage: string;
  values?: PostFormState["values"];
}) {
  throw buildValidationError<PostFormState>({
    action: args.action,
    code: args.code,
    message: "Post mutation action missing target identifier",
    resource: APP_ERROR_RESOURCE.posts,
    responseData: buildPostFormState(
      {
        form: args.formMessage,
      },
      args.values,
    ),
  });
}

async function buildDuplicatePostSlugState(args: {
  db: ReturnType<typeof getDbFromContext>;
  duplicateMessage: string;
  postId?: string;
  values: PostFormState["values"];
}) {
  return buildPostFormState(
    {
      slug: args.duplicateMessage,
    },
    args.values,
    await findAvailablePostSlug(args.db, args.values.title, args.postId),
  );
}

export async function ensurePostSlugAvailableOrThrow(args: {
  db: ReturnType<typeof getDbFromContext>;
  duplicateCode: AppErrorCode;
  duplicateMessage: string;
  postId?: string;
  submission: DashboardPostSubmission;
}) {
  if (!(await isPostSlugTaken(args.db, args.submission.slug, args.postId))) {
    return;
  }

  throw buildConflictError<PostFormState>({
    action: args.postId ? APP_ERROR_ACTION.update : APP_ERROR_ACTION.create,
    code: args.duplicateCode,
    details: {
      postId: args.postId ?? null,
      slug: args.submission.slug,
    },
    message: "Post mutation rejected because slug is already taken",
    resource: APP_ERROR_RESOURCE.posts,
    responseData: await buildDuplicatePostSlugState({
      db: args.db,
      duplicateMessage: args.duplicateMessage,
      postId: args.postId,
      values: args.submission,
    }),
    status: 409,
    targetId: args.postId ?? null,
    targetLabel: args.submission.title,
  });
}

export async function rethrowPostMutationConflict(
  error: unknown,
  args: {
    db: ReturnType<typeof getDbFromContext>;
    duplicateCode: AppErrorCode;
    duplicateMessage: string;
    postId?: string;
    submission: DashboardPostSubmission;
  },
) {
  if (isUniqueSlugConstraintError(error, "posts")) {
    throw buildConflictError<PostFormState>({
      action: args.postId ? APP_ERROR_ACTION.update : APP_ERROR_ACTION.create,
      code: args.duplicateCode,
      details: {
        postId: args.postId ?? null,
        slug: args.submission.slug,
      },
      message: "Post mutation rejected because slug constraint failed",
      resource: APP_ERROR_RESOURCE.posts,
      responseData: await buildDuplicatePostSlugState({
        db: args.db,
        duplicateMessage: args.duplicateMessage,
        postId: args.postId,
        values: args.submission,
      }),
      status: 409,
      targetId: args.postId ?? null,
      targetLabel: args.submission.title,
    });
  }

  throw error;
}

export async function revalidatePostCaches(context: AppLoadContext, request: Request) {
  await purgePublicBlogDataCache(context, request);
}
