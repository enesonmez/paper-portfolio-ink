import type { AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../db/context";
import { buildPostFormValues } from "~/domain/posts/form";
import {
  POST_FORM_FIELD,
  POST_MUTATION_INTENT,
  isPostMutationIntent,
} from "~/domain/posts/model";
import { parsePostFormData } from "~/lib/posts/post-form.server";
import { withDashboardAccess } from "~/shared/authz/authz.server";
import { buildValidationError } from "~/shared/errors/builders.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";
import { resolveParsedSubmission } from "~/shared/errors/submission.server";
import { readStringField } from "~/shared/forms/form-data.server";
import { loadI18nPayload } from "~/shared/i18n/i18n.server";
import { createTranslator } from "~/shared/i18n/i18n.shared";

import { buildDashboardPostsFormCopy } from "./copy";
import { authorizePostMutationOrThrow } from "./operations/_shared/authorization.server";
import { handleCreatePostMutation } from "./operations/create.server";
import { handleDeletePostMutation } from "./operations/delete.server";
import { handleUpdatePostMutation } from "./operations/update.server";

function buildInvalidIntentFormState(message: string) {
  return {
    errors: {
      form: message,
    },
    values: buildPostFormValues(),
  };
}

function parsePostSubmission(args: {
  formData: FormData;
  intent: typeof POST_MUTATION_INTENT.create | typeof POST_MUTATION_INTENT.update;
  t: ReturnType<typeof createTranslator>;
}) {
  return resolveParsedSubmission({
    action:
      args.intent === POST_MUTATION_INTENT.update
        ? APP_ERROR_ACTION.update
        : APP_ERROR_ACTION.create,
    code: APP_ERROR_CODE.posts.validation,
    message: "Post form validation failed",
    resource: APP_ERROR_RESOURCE.posts,
    submission: parsePostFormData(args.formData, args.t),
  });
}

function createPostSubmissionResolver(args: {
  formData: FormData;
  intent: typeof POST_MUTATION_INTENT.create | typeof POST_MUTATION_INTENT.update;
  t: ReturnType<typeof createTranslator>;
}) {
  let cachedSubmission: ReturnType<typeof parsePostSubmission> | undefined;

  return () => {
    if (cachedSubmission) {
      return cachedSubmission;
    }

    cachedSubmission = parsePostSubmission(args);
    return cachedSubmission;
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
  const supportedLocaleCodes = supportedLocales.map((item) => item.code);
  const formData = await request.formData();
  const intent = readStringField(formData, POST_FORM_FIELD.intent);
  const postId = readStringField(formData, POST_FORM_FIELD.postId);

  if (!isPostMutationIntent(intent)) {
    throw buildValidationError({
      action: APP_ERROR_ACTION.mutate,
      code: APP_ERROR_CODE.posts.mutation.invalidIntent,
      details: {
        intent,
      },
      message: "Post mutation received an unsupported intent",
      resource: APP_ERROR_RESOURCE.posts,
      responseData: buildInvalidIntentFormState(formCopy.errors.forbidden),
      status: 400,
    });
  }

  const resolveCreateSubmission = createPostSubmissionResolver({
    formData,
    intent: POST_MUTATION_INTENT.create,
    t,
  });
  const resolveUpdateSubmission = createPostSubmissionResolver({
    formData,
    intent: POST_MUTATION_INTENT.update,
    t,
  });

  return withDashboardAccess({
    request,
    context,
    authorize: async ({ actor }) => {
      await authorizePostMutationOrThrow({
        actor,
        context,
        formCopy,
        intent,
        postId,
        values:
          intent === POST_MUTATION_INTENT.create
            ? resolveCreateSubmission()
            : intent === POST_MUTATION_INTENT.update
              ? resolveUpdateSubmission()
              : undefined,
      });
    },
    handle: async ({ actor }) => {
      const db = getDbFromContext(context);
      const mutationHandlers = {
        [POST_MUTATION_INTENT.create]: () =>
          handleCreatePostMutation({
            actor,
            context,
            db,
            formCopy,
            locale,
            request,
            submission: resolveCreateSubmission(),
            supportedLocaleCodes,
            t,
          }),
        [POST_MUTATION_INTENT.delete]: () =>
          handleDeletePostMutation({
            context,
            db,
            formCopy,
            locale,
            postId,
            request,
            supportedLocaleCodes,
          }),
        [POST_MUTATION_INTENT.update]: () =>
          handleUpdatePostMutation({
            context,
            db,
            formCopy,
            locale,
            postId,
            request,
            submission: resolveUpdateSubmission(),
            supportedLocaleCodes,
            t,
          }),
      } as const;

      return mutationHandlers[intent]();
    },
  });
}
