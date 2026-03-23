import type { AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../db/context";
import { POST_FORM_FIELD, POST_MUTATION_INTENT } from "~/domain/posts/model";
import { actorHasAnyClaim, requireDashboardActor } from "~/shared/authz/authz.server";
import { AUTHORIZATION_CLAIM } from "~/shared/authz/model";
import {
  canAccessDashboardPosts,
  canCreatePosts,
  listAuthorizedPosts,
} from "~/shared/authz/post-policy.server";
import { buildAuthorizationError } from "~/shared/errors/builders.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";
import { resolveParsedSubmission } from "~/shared/errors/submission.server";
import { readStringField } from "~/shared/forms/form-data.server";
import { loadI18nPayload } from "~/shared/i18n/i18n.server";
import { createTranslator } from "~/shared/i18n/i18n.shared";
import { parsePostFormData } from "~/lib/posts/post-form.server";

import { buildDashboardPostsFormCopy } from "./copy";
import {
  handleCreatePostMutation,
  handleDeletePostMutation,
  handleUpdatePostMutation,
} from "./mutations.server";
import {
  buildDeniedDashboardPostsLoaderData,
  buildDashboardPostsMetrics,
  resolveDashboardPostsForm,
  type DashboardPostsLoaderData,
} from "./state";

export async function loadDashboardPostsData(
  context: AppLoadContext,
  request: Request,
): Promise<DashboardPostsLoaderData | Response> {
  const auth = await requireDashboardActor(context, request);

  if (auth instanceof Response) {
    return auth;
  }

  if (!canAccessDashboardPosts(auth.actor)) {
    throw buildAuthorizationError<DashboardPostsLoaderData>({
      action: APP_ERROR_ACTION.read,
      code: APP_ERROR_CODE.posts.read.forbidden,
      message: "Post dashboard access denied",
      resource: APP_ERROR_RESOURCE.posts,
      responseData: buildDeniedDashboardPostsLoaderData(),
      status: 403,
    });
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
    return handleDeletePostMutation({
      auth,
      context,
      db,
      formCopy,
      locale,
      postId,
      request,
      supportedLocaleCodes,
    });
  }

  const submission = resolveParsedSubmission({
    action:
      intent === POST_MUTATION_INTENT.update
        ? APP_ERROR_ACTION.update
        : APP_ERROR_ACTION.create,
    code: APP_ERROR_CODE.posts.validation,
    message: "Post form validation failed",
    resource: APP_ERROR_RESOURCE.posts,
    submission: parsePostFormData(formData, t),
  });

  if (intent === POST_MUTATION_INTENT.update) {
    return handleUpdatePostMutation({
      auth,
      context,
      db,
      formCopy,
      locale,
      postId,
      request,
      submission,
      supportedLocaleCodes,
      t,
    });
  }

  return handleCreatePostMutation({
    auth,
    context,
    db,
    formCopy,
    locale,
    request,
    submission,
    supportedLocaleCodes,
    t,
  });
}
