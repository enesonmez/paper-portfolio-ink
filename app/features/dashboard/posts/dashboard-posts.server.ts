import { data, redirect, type AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../db/context";
import { loadI18nPayload } from "~/shared/i18n/i18n.server";
import { buildLocalizedPath, createTranslator } from "~/shared/i18n/i18n.shared";
import { purgePublicBlogDataCache } from "~/features/public/blog/public-blog.server";
import { buildLoginRedirect } from "~/shared/auth/login.server";
import { requireSession } from "~/shared/auth/session.server";
import { getSessionUserId } from "~/shared/auth/session-user";
import {
  buildPostFormValues,
  type PostFormState,
} from "~/features/posts/post-form.shared";
import { POST_FORM_FIELD, POST_MUTATION_INTENT } from "~/features/posts/post.shared";
import { hasParsedPostData, parsePostFormData } from "~/lib/posts/post-form.server";
import {
  createPost,
  deletePost,
  findAvailablePostSlug,
  isPostSlugTaken,
  listPosts,
  updatePost,
} from "~/lib/posts/posts.server";
import { isUniqueSlugConstraintError } from "~/lib/slug";

import { buildDashboardPostsFormCopy } from "./dashboard-posts.constants";
import {
  buildDashboardPostsMetrics,
  resolveDashboardPostsForm,
  type DashboardPostsLoaderData,
} from "./dashboard-posts.shared";

function readStringField(formData: FormData, field: string) {
  const value = formData.get(field);

  return typeof value === "string" ? value : "";
}

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
  const session = await requireSession(request, context, {
    redirectTo: await buildLoginRedirect(context, request),
  });

  if (session instanceof Response) {
    return session;
  }

  const db = getDbFromContext(context);
  const posts = await listPosts(db);
  const url = new URL(request.url);

  return {
    form: resolveDashboardPostsForm({
      editId: url.searchParams.get("edit"),
      modal: url.searchParams.get("modal"),
      posts,
    }),
    metrics: buildDashboardPostsMetrics(posts),
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
  const session = await requireSession(request, context, {
    redirectTo: await buildLoginRedirect(context, request),
  });
  const supportedLocaleCodes = supportedLocales.map((item) => item.code);

  if (session instanceof Response) {
    return session;
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

  const authorId = getSessionUserId(session);

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
