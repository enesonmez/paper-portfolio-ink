import { data, redirect, type AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../db/context";
import { purgePublicBlogDataCache } from "~/features/public/blog/public-blog.server";
import { buildLoginRedirect } from "~/lib/auth/login.server";
import { requireSession } from "~/lib/auth/session.server";
import { getSessionUserId } from "~/lib/auth/session-user";
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

import { DASHBOARD_POSTS_FORM_COPY } from "./dashboard-posts.constants";
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
  postId?: string,
) {
  const db = getDbFromContext(context);

  return data<PostFormState>(
    {
      errors: {
        slug: "Bu slug zaten kullanimda. Baska bir slug sec.",
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
    redirectTo: buildLoginRedirect(request),
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
  const session = await requireSession(request, context, {
    redirectTo: buildLoginRedirect(request),
  });

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
            form: DASHBOARD_POSTS_FORM_COPY.errors.deleteMissingPost,
          },
          values: buildPostFormValues(),
        },
        { status: 400 },
      );
    }

    await deletePost(db, postId);
    await purgePublicBlogDataCache(context, request);

    return redirect("/dashboard/posts");
  }

  const submission = parsePostFormData(formData);

  if (!hasParsedPostData(submission)) {
    return data<PostFormState>(submission, { status: 400 });
  }

  if (intent === POST_MUTATION_INTENT.update) {
    if (!postId) {
      return data<PostFormState>(
        {
          errors: {
            form: DASHBOARD_POSTS_FORM_COPY.errors.updateMissingPost,
          },
          values: buildPostActionValues(submission.data),
        },
        { status: 400 },
      );
    }

    if (await isPostSlugTaken(db, submission.data.slug, postId)) {
      return buildDuplicatePostSlugState(context, submission.data, postId);
    }

    try {
      await updatePost(db, postId, submission.data);
    } catch (error) {
      if (isUniqueSlugConstraintError(error, "posts")) {
        return buildDuplicatePostSlugState(context, submission.data, postId);
      }

      throw error;
    }

    await purgePublicBlogDataCache(context, request);

    return redirect("/dashboard/posts");
  }

  const authorId = getSessionUserId(session);

  if (!authorId) {
    return data<PostFormState>(
      {
        errors: {
          form: DASHBOARD_POSTS_FORM_COPY.errors.missingAuthor,
        },
        values: buildPostActionValues(submission.data),
      },
      { status: 400 },
    );
  }

  if (await isPostSlugTaken(db, submission.data.slug)) {
    return buildDuplicatePostSlugState(context, submission.data);
  }

  try {
    await createPost(db, authorId, submission.data);
  } catch (error) {
    if (isUniqueSlugConstraintError(error, "posts")) {
      return buildDuplicatePostSlugState(context, submission.data);
    }

    throw error;
  }

  await purgePublicBlogDataCache(context, request);

  return redirect("/dashboard/posts");
}
