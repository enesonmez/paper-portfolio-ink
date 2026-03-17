import { data, redirect, type AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../db/context";
import { buildLoginRedirect } from "~/lib/auth/login.server";
import { requireSession } from "~/lib/auth/session.server";
import {
  buildPostFormValues,
  type PostFormState,
} from "~/features/posts/post-form.shared";
import {
  POST_FORM_FIELD,
  POST_MUTATION_INTENT,
} from "~/features/posts/post.shared";
import {
  hasParsedPostData,
  parsePostFormData,
} from "~/lib/posts/post-form.server";
import {
  createPost,
  deletePost,
  listPosts,
  updatePost,
} from "~/lib/posts/posts.server";

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

function resolveSessionUserId(session: unknown) {
  if (
    typeof session === "object" &&
    session !== null &&
    "user" in session &&
    typeof session.user === "object" &&
    session.user !== null &&
    "id" in session.user &&
    typeof session.user.id === "string"
  ) {
    return session.user.id;
  }

  return null;
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
          values: submission.data,
        },
        { status: 400 },
      );
    }

    await updatePost(db, postId, submission.data);

    return redirect("/dashboard/posts");
  }

  const authorId = resolveSessionUserId(session);

  if (!authorId) {
    return data<PostFormState>(
      {
        errors: {
          form: DASHBOARD_POSTS_FORM_COPY.errors.missingAuthor,
        },
        values: submission.data,
      },
      { status: 400 },
    );
  }

  await createPost(db, authorId, submission.data);

  return redirect("/dashboard/posts");
}
