import { data, redirect, type AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../db/context";
import { loadI18nPayload } from "~/shared/i18n/i18n.server";
import { buildLocalizedPath, createTranslator } from "~/shared/i18n/i18n.shared";
import { purgePublicBlogDataCache } from "~/features/public/blog/server";
import {
  actorHasAnyClaim,
  buildForbiddenFormState,
  requireDashboardActor,
} from "~/shared/authz/authz.server";
import {
  canAccessDashboardPosts,
  canCreatePosts,
  canMutatePost,
  listAuthorizedPosts,
} from "~/shared/authz/post-policy.server";
import { AUTHORIZATION_CLAIM } from "~/shared/authz/model";
import { buildPostFormValues, type PostFormState } from "~/domain/posts/form";
import { POST_FORM_FIELD, POST_MUTATION_INTENT } from "~/domain/posts/model";
import { hasParsedPostData, parsePostFormData } from "~/lib/posts/post-form.server";
import {
  createPost,
  deletePost,
  findAvailablePostSlug,
  isPostSlugTaken,
  updatePost,
} from "~/lib/posts/posts.server";
import { isUniqueSlugConstraintError } from "~/lib/slug";

import { buildDashboardPostsFormCopy } from "./copy";
import {
  buildDashboardPostsMetrics,
  resolveDashboardPostsForm,
  type DashboardPostsLoaderData,
} from "./state";
import { readStringField } from "~/shared/forms/form-data.server";

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

  return data<PostFormState>(
    {
      errors: {
        slug: duplicateMessage,
      },
      slugSuggestion: await findAvailablePostSlug(db, values.title, postId),
      values: buildPostActionValues(values),
    },
    { status: 409 },
  );
}

export async function loadDashboardPostsData(
  context: AppLoadContext,
  request: Request,
): Promise<DashboardPostsLoaderData | Response> {
  const auth = await requireDashboardActor(context, request);

  if (auth instanceof Response) {
    return auth;
  }

  if (!canAccessDashboardPosts(auth.actor)) {
    return {
      access: "denied",
      form: resolveDashboardPostsForm({
        editId: null,
        modal: null,
        posts: [],
      }),
      metrics: buildDashboardPostsMetrics([]),
      permissions: {
        canCreate: false,
        canDelete: false,
        canUpdate: false,
      },
      posts: [],
    };
  }

  const posts = await listAuthorizedPosts(context, auth.actor);
  const url = new URL(request.url);

  return {
    access: "granted",
    form: resolveDashboardPostsForm({
      editId: url.searchParams.get("edit"),
      modal: url.searchParams.get("modal"),
      posts,
    }),
    metrics: buildDashboardPostsMetrics(posts),
    permissions: {
      canCreate: canCreatePosts(auth.actor),
      canDelete: actorHasAnyClaim(auth.actor, [
        AUTHORIZATION_CLAIM.postsDeleteAny,
        AUTHORIZATION_CLAIM.postsDeleteOwn,
      ]),
      canUpdate: actorHasAnyClaim(auth.actor, [
        AUTHORIZATION_CLAIM.postsUpdateAny,
        AUTHORIZATION_CLAIM.postsUpdateOwn,
      ]),
    },
    posts,
  };
}

export async function handleDashboardPostsAction(
  context: AppLoadContext,
  request: Request,
) {
  const { locale, messages, supportedLocales } = await loadI18nPayload(
    context,
    request,
  );
  const t = createTranslator(messages);
  const formCopy = buildDashboardPostsFormCopy(t);
  const auth = await requireDashboardActor(context, request);
  const supportedLocaleCodes = supportedLocales.map((item) => item.code);

  if (auth instanceof Response) {
    return auth;
  }

  const db = getDbFromContext(context);
  const formData = await request.formData();
  const intent = readStringField(formData, POST_FORM_FIELD.intent);
  const postId = readStringField(formData, POST_FORM_FIELD.postId);

  if (intent === POST_MUTATION_INTENT.delete) {
    if (!postId) {
      return data<PostFormState>(
        {
          errors: {
            form: formCopy.errors.deleteMissingPost,
          },
          values: buildPostFormValues(),
        },
        { status: 400 },
      );
    }

    if (!(await canMutatePost(context, auth.actor, "delete", postId))) {
      return buildForbiddenFormState(formCopy.errors.forbidden, buildPostFormValues());
    }

    await deletePost(db, postId);
    await purgePublicBlogDataCache(context, request);

    return redirect(
      buildLocalizedPath(locale, "/dashboard/posts", supportedLocaleCodes),
    );
  }

  const submission = parsePostFormData(formData, t);

  if (!hasParsedPostData(submission)) {
    return data<PostFormState>(submission, { status: 400 });
  }

  if (intent === POST_MUTATION_INTENT.update) {
    if (!postId) {
      return data<PostFormState>(
        {
          errors: {
            form: formCopy.errors.updateMissingPost,
          },
          values: buildPostActionValues(submission.data),
        },
        { status: 400 },
      );
    }

    if (!(await canMutatePost(context, auth.actor, "update", postId))) {
      return buildForbiddenFormState(
        formCopy.errors.forbidden,
        buildPostActionValues(submission.data),
      );
    }

    if (await isPostSlugTaken(db, submission.data.slug, postId)) {
      return buildDuplicatePostSlugState(
        context,
        submission.data,
        t("validation.slug.taken"),
        postId,
      );
    }

    try {
      await updatePost(db, postId, submission.data);
    } catch (error) {
      if (isUniqueSlugConstraintError(error, "posts")) {
        return buildDuplicatePostSlugState(
          context,
          submission.data,
          t("validation.slug.taken"),
          postId,
        );
      }

      throw error;
    }

    await purgePublicBlogDataCache(context, request);

    return redirect(
      buildLocalizedPath(locale, "/dashboard/posts", supportedLocaleCodes),
    );
  }

  const authorId = auth.actor.userId;

  if (!canCreatePosts(auth.actor)) {
    return buildForbiddenFormState(
      formCopy.errors.forbidden,
      buildPostActionValues(submission.data),
    );
  }

  if (!authorId) {
    return data<PostFormState>(
      {
        errors: {
          form: formCopy.errors.missingAuthor,
        },
        values: buildPostActionValues(submission.data),
      },
      { status: 400 },
    );
  }

  if (await isPostSlugTaken(db, submission.data.slug)) {
    return buildDuplicatePostSlugState(
      context,
      submission.data,
      t("validation.slug.taken"),
    );
  }

  try {
    await createPost(db, authorId, submission.data);
  } catch (error) {
    if (isUniqueSlugConstraintError(error, "posts")) {
      return buildDuplicatePostSlugState(
        context,
        submission.data,
        t("validation.slug.taken"),
      );
    }

    throw error;
  }

  await purgePublicBlogDataCache(context, request);

  return redirect(buildLocalizedPath(locale, "/dashboard/posts", supportedLocaleCodes));
}
