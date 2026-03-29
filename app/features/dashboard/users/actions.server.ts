import type { AppLoadContext } from "react-router";

import { buildUserFormValues } from "~/domain/users/form";
import {
  USER_FORM_FIELD,
  USER_MUTATION_INTENT,
  isUserMutationIntent,
} from "~/domain/users/model";
import { getDbFromContext } from "../../../../db/context";
import { parseUserFormData } from "~/lib/users/user-form.server";
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

import { buildDashboardUsersFormCopy } from "./copy";
import { authorizeUserMutationOrThrow } from "./operations/_shared/authorization.server";
import { handleCreateUserMutation } from "./operations/create.server";
import { handleDeleteUserMutation } from "./operations/delete.server";
import { handleUpdateUserMutation } from "./operations/update.server";

function buildInvalidIntentFormState(message: string) {
  return {
    errors: {
      form: message,
    },
    values: buildUserFormValues(),
  };
}

function parseUserSubmission(args: {
  formData: FormData;
  intent: typeof USER_MUTATION_INTENT.create | typeof USER_MUTATION_INTENT.update;
  t: ReturnType<typeof createTranslator>;
}) {
  return resolveParsedSubmission({
    action:
      args.intent === USER_MUTATION_INTENT.update
        ? APP_ERROR_ACTION.update
        : APP_ERROR_ACTION.create,
    code: APP_ERROR_CODE.users.validation,
    message: "User form validation failed",
    resource: APP_ERROR_RESOURCE.users,
    submission: parseUserFormData(args.formData, args.intent, args.t),
  });
}

export async function handleDashboardUsersAction(
  context: AppLoadContext,
  request: Request,
) {
  const { locale, messages, supportedLocales } = await loadI18nPayload(
    context,
    request,
  );
  const t = createTranslator(messages);
  const formCopy = buildDashboardUsersFormCopy(t);
  const supportedLocaleCodes = supportedLocales.map((item) => item.code);
  const formData = await request.formData();
  const intent = readStringField(formData, USER_FORM_FIELD.intent);
  const userId = readStringField(formData, USER_FORM_FIELD.userId);

  if (!isUserMutationIntent(intent)) {
    throw buildValidationError({
      action: APP_ERROR_ACTION.mutate,
      code: APP_ERROR_CODE.users.mutation.invalidIntent,
      details: {
        intent,
      },
      message: "User mutation received an unsupported intent",
      resource: APP_ERROR_RESOURCE.users,
      responseData: buildInvalidIntentFormState(formCopy.errors.forbidden),
      status: 400,
    });
  }

  const resolveCreateSubmission = () =>
    parseUserSubmission({
      formData,
      intent: USER_MUTATION_INTENT.create,
      t,
    });
  const resolveUpdateSubmission = () =>
    parseUserSubmission({
      formData,
      intent: USER_MUTATION_INTENT.update,
      t,
    });

  return withDashboardAccess({
    request,
    context,
    authorize: ({ actor }) =>
      authorizeUserMutationOrThrow({
        actor,
        formCopy,
        intent,
      }),
    handle: async () => {
      const db = getDbFromContext(context);
      const mutationHandlers = {
        [USER_MUTATION_INTENT.create]: () =>
          handleCreateUserMutation({
            context,
            db,
            formCopy,
            intent,
            locale,
            request,
            submission: resolveCreateSubmission(),
            supportedLocaleCodes,
          }),
        [USER_MUTATION_INTENT.delete]: () =>
          handleDeleteUserMutation({
            context,
            db,
            formCopy,
            intent,
            locale,
            request,
            supportedLocaleCodes,
            userId,
          }),
        [USER_MUTATION_INTENT.update]: () =>
          handleUpdateUserMutation({
            context,
            db,
            formCopy,
            intent,
            locale,
            request,
            submission: resolveUpdateSubmission(),
            supportedLocaleCodes,
            userId,
          }),
      } as const;

      return mutationHandlers[intent]();
    },
  });
}
